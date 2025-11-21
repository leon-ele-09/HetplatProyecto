using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_Proyecto.Models;
using System.Text.Json.Serialization;

namespace API_Proyecto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim);
        }

        // GET: api/Projects - Solo los proyectos del usuario
        [HttpGet]
        [HttpGet]
        public async Task<ActionResult<List<ProjectDTO>>> GetProjects()
        {
            var userId = GetCurrentUserId();

            var memberProjectIds = await _context.ProjectMembers
                .Where(pm => pm.PersonId == userId)
                .Select(pm => pm.ProjectId)
                .ToListAsync();

            var projects = await _context.Projects
                .Where(p => memberProjectIds.Contains(p.Id))
                .ToListAsync();

            var owning = await _context.Projects
                .Where(p => userId == p.CreatorId)
                .ToListAsync();

            var completo = owning.Concat(projects).ToList();

            return Ok(completo.Select(p => new ProjectDTO
            {
                Id = p.Id.ToString(),
                Nombre = p.Name,
                Descripcion = p.Description,
                Tipo = p.Type,
                IsOwner = p.CreatorId == userId
            }).ToList());
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDTO>> GetProject(Guid id)
        {
            var userId = GetCurrentUserId();

            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            // Verificar que el usuario sea el creador
            if (project.CreatorId != userId)
            {
                return Forbid();
            }

            var projectDTO = new ProjectDTO
            {
                Id = project.Id.ToString(),
                Nombre = project.Name,
                Descripcion = project.Description,
                Tipo = project.Type,
                IsOwner = project.CreatorId == userId
            };

            return Ok(projectDTO);
        }

        // POST: api/Projects
        [HttpPost]
        public async Task<ActionResult<ProjectDTO>> PostProject(CreateProjectRequest request)
        {
            var userId = GetCurrentUserId();

            var project = new Project
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Type = request.Type,
                CreatorId = userId,
                CreatedAt = DateTime.UtcNow,
                StartedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var projectDTO = new ProjectDTO
            {
                Id = project.Id.ToString(),
                Nombre = project.Name,
                Descripcion = project.Description,
                Tipo = project.Type,
                IsOwner = true
            };

            return CreatedAtAction("GetProject", new { id = project.Id }, projectDTO);
        }

        // DELETE: api/Projects/5 - Solo el owner puede borrar
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            // Solo el creador puede borrar
            if (project.CreatorId != userId)
            {
                return Forbid();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Projects/{id}/members - Invitar miembro al proyecto
        [HttpPost("{id}/members")]
        public async Task<IActionResult> AddMember(Guid id, AddMemberRequest request)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            // Solo el owner puede agregar miembros
            if (project.CreatorId != userId)
            {
                return Forbid();
            }

            // Buscar persona por email
            var person = await _context.People
                .FirstOrDefaultAsync(p => p.Email == request.Email && p.Active);

            if (person == null)
            {
                return BadRequest(new { message = "Usuario no encontrado o inactivo" });
            }

            // Verificar si ya es miembro
            var existingMember = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.PersonId == person.Id);

            if (existingMember != null)
            {
                return BadRequest(new { message = "El usuario ya es miembro del proyecto" });
            }

            // Agregar miembro
            var projectMember = new ProjectMember
            {
                ProjectId = id,
                PersonId = person.Id,
                Role = request.Role ?? "Member"
            };

            _context.ProjectMembers.Add(projectMember);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Miembro agregado exitosamente", email = person.Email });
        }

        // GET: api/Projects/{id}/members - Listar miembros del proyecto
        [HttpGet("{id}/members")]
        public async Task<ActionResult<List<ProjectMemberDTO>>> GetMembers(Guid id)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            // Solo el owner puede ver miembros
            if (project.CreatorId != userId)
            {
                return Forbid();
            }

            var members = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == id)
                .Include(pm => pm.Person)
                .Select(pm => new ProjectMemberDTO
                {
                    PersonId = pm.PersonId.ToString(),
                    Email = pm.Person.Email,
                    Role = pm.Role
                })
                .ToListAsync();

            return Ok(members);
        }

        // DELETE: api/Projects/{id}/members/{personId} - Remover miembro
        [HttpDelete("{id}/members/{personId}")]
        public async Task<IActionResult> RemoveMember(Guid id, Guid personId)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            // Solo el owner puede remover miembros
            if (project.CreatorId != userId)
            {
                return Forbid();
            }

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.PersonId == personId);

            if (member == null)
            {
                return NotFound();
            }

            _context.ProjectMembers.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Projects/{id}/stats - Estadísticas del proyecto
        [HttpGet("{id}/stats")]
        public async Task<ActionResult<object>> GetProjectStats(Guid id)
        {
            var userId = GetCurrentUserId();

            if (!await IsProjectMemberAsync(id))
                return Forbid();

            var tasks = await _context.TaskItems
                .Where(t => t.ProjectId == id)
                .Include(t => t.AssignedPerson)
                .ToListAsync();

            var totalTasks = tasks.Count;
            var completedTasks = tasks.Count(t => t.Completed);

            var userStats = tasks
                .Where(t => t.AssignedTo.HasValue)
                .GroupBy(t => new { t.AssignedTo, t.AssignedPerson.Email })
                .Select(g => new
                {
                    userId = g.Key.AssignedTo.ToString(),
                    email = g.Key.Email,
                    total = g.Count(),
                    completed = g.Count(t => t.Completed)
                })
                .ToList();

            return Ok(new
            {
                totalTasks,
                completedTasks,
                userStats
            });
        }

        // POST: api/Projects/{id}/leave - Dejar proyecto
        [HttpPost("{id}/leave")]
        public async Task<IActionResult> LeaveProject(Guid id)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FindAsync(id);

            if (project == null) return NotFound();
            if (project.CreatorId == userId)
                return BadRequest(new { message = "El owner no puede abandonar el proyecto" });

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.PersonId == userId);

            if (member == null)
                return NotFound(new { message = "No eres miembro de este proyecto" });

            _context.ProjectMembers.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> IsProjectMemberAsync(Guid projectId)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FindAsync(projectId);
            if (project?.CreatorId == userId) return true;
            return await _context.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.PersonId == userId);
        }

        private bool ProjectExists(Guid id)
        {
            return _context.Projects.Any(e => e.Id == id);
        }
    }

    public class ProjectDTO
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("Nombre")]
        public string Nombre { get; set; }

        [JsonPropertyName("Descripcion")]
        public string Descripcion { get; set; }

        [JsonPropertyName("Tipo")]
        public string Tipo { get; set; }

        [JsonPropertyName("isOwner")]
        public bool IsOwner { get; set; }
    }

    public class CreateProjectRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
    }

    public class AddMemberRequest
    {
        public string Email { get; set; }
        public string Role { get; set; }
    }

    public class ProjectMemberDTO
    {
        [JsonPropertyName("personId")]
        public string PersonId { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("role")]
        public string Role { get; set; }
    }
}