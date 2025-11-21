using API_Proyecto.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace API_Proyecto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetCurrentUserId()
        {
            return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        }

            [HttpGet]
            public async Task<ActionResult<IEnumerable<EventDTO>>> GetEvents([FromQuery] Guid? projectId = null)
            {
                var query = _context.Events.AsQueryable();
                if (projectId.HasValue)
                    query = query.Where(e => e.ProjectId == projectId);

                var events = await query.ToListAsync();
                return Ok(events.Select(e => new EventDTO
                {
                    Id = e.Id.ToString(),
                    ProjectId = e.ProjectId?.ToString(),
                    Title = e.Title,
                    Type = e.Type,
                    StartedAt = e.StartedAt,
                    EndedAt = e.EndedAt
                }));
            }

        [HttpPost]
        public async Task<ActionResult<EventDTO>> PostEvent(CreateEventRequest req)
        {
            var startDate = req.StartedAt.HasValue
                ? DateTime.SpecifyKind(req.StartedAt.Value, DateTimeKind.Utc)
                : DateTime.UtcNow;

            var endDate = req.EndedAt.HasValue
                ? DateTime.SpecifyKind(req.EndedAt.Value, DateTimeKind.Utc)
                : (DateTime?)null;

            var ev = new Event
            {
                Id = Guid.NewGuid(),
                ProjectId = req.ProjectId,
                Title = req.Title,
                Type = req.Type,
                StartedAt = startDate,
                EndedAt = endDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.Events.Add(ev);
            await _context.SaveChangesAsync();

            return Ok(new EventDTO
            {
                Id = ev.Id.ToString(),
                ProjectId = ev.ProjectId?.ToString(),
                Title = ev.Title,
                Type = ev.Type,
                StartedAt = ev.StartedAt,
                EndedAt = ev.EndedAt
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var ev = await _context.Events.FindAsync(id);
            if (ev == null) return NotFound();

            _context.Events.Remove(ev);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class EventDTO
    {
        [JsonPropertyName("id")] public string Id { get; set; }
        [JsonPropertyName("projectId")] public string ProjectId { get; set; }
        [JsonPropertyName("title")] public string Title { get; set; }
        [JsonPropertyName("type")] public string Type { get; set; }
        [JsonPropertyName("startedAt")] public DateTime? StartedAt { get; set; }
        [JsonPropertyName("endedAt")] public DateTime? EndedAt { get; set; }
    }

    public class CreateEventRequest
    {
        public Guid? ProjectId { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
    }
}