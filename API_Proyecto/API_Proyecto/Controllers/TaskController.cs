using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API_Proyecto.Models;
using System.Text.Json.Serialization;

namespace API_Proyecto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetCurrentUserId()
        {
            return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        }

        private async Task<bool> IsProjectOwner(Guid? projectId)
        {
            if (!projectId.HasValue) return false;
            var project = await _context.Projects.FindAsync(projectId);
            return project?.CreatorId == GetCurrentUserId();
        }

        private async Task<bool> IsProjectMember(Guid? projectId)
        {
            if (!projectId.HasValue) return false;
            var userId = GetCurrentUserId();
            var project = await _context.Projects.FindAsync(projectId);
            if (project?.CreatorId == userId) return true;
            return await _context.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.PersonId == userId);
        }

        [HttpGet]
        public async Task<ActionResult<List<TaskDTO>>> GetTasks([FromQuery] Guid? projectId = null)
        {
            if (!projectId.HasValue) return BadRequest("projectId required");
            if (!await IsProjectMember(projectId)) return Forbid();

            var tasks = await _context.TaskItems
                .Where(t => t.ProjectId == projectId)
                .Include(t => t.AssignedPerson)
                .ToListAsync();

            return Ok(tasks.Select(t => new TaskDTO
            {
                Id = t.Id.ToString(),
                ProjectId = t.ProjectId?.ToString(),
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                Type = t.Type,
                Status = t.Active ? "active" : "inactive",
                DependsOn = t.DependsOn?.Select(d => d.ToString()).ToList() ?? new List<string>(),
                StartDate = t.StartDate,
                FinishDate = t.FinishDate,
                Completed = t.Completed,
                AssignedTo = t.AssignedTo?.ToString(),
                AssignedEmail = t.AssignedPerson?.Email
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDTO>> GetTask(Guid id)
        {
            var task = await _context.TaskItems
                .Include(t => t.AssignedPerson)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();
            if (!await IsProjectMember(task.ProjectId)) return Forbid();

            return Ok(MapToDTO(task));
        }

        [HttpPost]
        public async Task<ActionResult<TaskDTO>> PostTask(CreateTaskRequest req)
        {
            if (!await IsProjectOwner(req.ProjectId)) return Forbid();

            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                ProjectId = req.ProjectId,
                Title = req.Title,
                Description = req.Description,
                Priority = req.Priority,
                Type = req.Type,
                Active = true,
                CreatedAt = DateTime.UtcNow,
                DependsOn = req.DependsOn?.Select(Guid.Parse).ToList() ?? new List<Guid>(),
                StartDate = req.StartDate.HasValue ? DateTime.SpecifyKind(req.StartDate.Value, DateTimeKind.Utc) : null,
                FinishDate = req.FinishDate.HasValue ? DateTime.SpecifyKind(req.FinishDate.Value, DateTimeKind.Utc) : null,
                Completed = false,
                AssignedTo = string.IsNullOrEmpty(req.AssignedTo) ? null : Guid.Parse(req.AssignedTo)
            };

            _context.TaskItems.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTask", new { id = task.Id }, MapToDTO(task));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(Guid id, UpdateTaskRequest req)
        {
            var task = await _context.TaskItems.FindAsync(id);
            if (task == null) return NotFound();
            if (!await IsProjectOwner(task.ProjectId)) return Forbid();

            task.Title = req.Title;
            task.Description = req.Description;
            task.Priority = req.Priority;
            task.Type = req.Type;
            task.Active = req.Active;
            task.DependsOn = req.DependsOn?.Select(Guid.Parse).ToList() ?? new List<Guid>();
            task.StartDate = req.StartDate.HasValue ? DateTime.SpecifyKind(req.StartDate.Value, DateTimeKind.Utc) : null;
            task.FinishDate = req.FinishDate.HasValue ? DateTime.SpecifyKind(req.FinishDate.Value, DateTimeKind.Utc) : null;
            task.AssignedTo = string.IsNullOrEmpty(req.AssignedTo) ? null : Guid.Parse(req.AssignedTo);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> CompleteTask(Guid id)
        {
            var task = await _context.TaskItems.FindAsync(id);
            if (task == null) return NotFound();
            if (!await IsProjectMember(task.ProjectId)) return Forbid();

            task.Completed = !task.Completed;
            if (task.Completed && !task.FinishDate.HasValue)
                task.FinishDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var task = await _context.TaskItems.FindAsync(id);
            if (task == null) return NotFound();
            if (!await IsProjectOwner(task.ProjectId)) return Forbid();

            _context.TaskItems.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private TaskDTO MapToDTO(TaskItem t) => new TaskDTO
        {
            Id = t.Id.ToString(),
            ProjectId = t.ProjectId?.ToString(),
            Title = t.Title,
            Description = t.Description,
            Priority = t.Priority,
            Type = t.Type,
            Status = t.Active ? "active" : "inactive",
            DependsOn = t.DependsOn?.Select(d => d.ToString()).ToList() ?? new List<string>(),
            StartDate = t.StartDate,
            FinishDate = t.FinishDate,
            Completed = t.Completed,
            AssignedTo = t.AssignedTo?.ToString(),
            AssignedEmail = t.AssignedPerson?.Email
        };
    }

    public class TaskDTO
    {
        [JsonPropertyName("id")] public string Id { get; set; }
        [JsonPropertyName("projectId")] public string ProjectId { get; set; }
        [JsonPropertyName("title")] public string Title { get; set; }
        [JsonPropertyName("description")] public string Description { get; set; }
        [JsonPropertyName("priority")] public string Priority { get; set; }
        [JsonPropertyName("type")] public string Type { get; set; }
        [JsonPropertyName("status")] public string Status { get; set; }
        [JsonPropertyName("dependsOn")] public List<string> DependsOn { get; set; }
        [JsonPropertyName("startDate")] public DateTime? StartDate { get; set; }
        [JsonPropertyName("finishDate")] public DateTime? FinishDate { get; set; }
        [JsonPropertyName("completed")] public bool Completed { get; set; }
        [JsonPropertyName("assignedTo")] public string AssignedTo { get; set; }
        [JsonPropertyName("assignedEmail")] public string AssignedEmail { get; set; }
    }

    public class CreateTaskRequest
    {
        public Guid? ProjectId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Type { get; set; }
        public List<string> DependsOn { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? FinishDate { get; set; }
        public string AssignedTo { get; set; }
    }

    public class UpdateTaskRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Type { get; set; }
        public bool Active { get; set; }
        public List<string> DependsOn { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? FinishDate { get; set; }
        public string AssignedTo { get; set; }
    }
}