using System;
using System.Collections.Generic;

namespace API_Proyecto.Models;

public partial class TaskItem
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Priority { get; set; } = null!;
    public string Type { get; set; } = null!;
    public bool Active { get; set; }
    public DateTime? CreatedAt { get; set; }
    public List<Guid> DependsOn { get; set; } = new List<Guid>();
    public DateTime? StartDate { get; set; }
    public DateTime? FinishDate { get; set; }
    public bool Completed { get; set; }
    public Guid? AssignedTo { get; set; }
    public virtual Project? Project { get; set; }
    public virtual Person? AssignedPerson { get; set; }
}