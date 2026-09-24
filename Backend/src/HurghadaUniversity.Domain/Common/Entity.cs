namespace HurghadaUniversity.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    public override bool Equals(object? obj)
        => obj is Entity other && Id == other.Id;

    public override int GetHashCode() => Id.GetHashCode();
}

public abstract class AuditableEntity : Entity
{
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
    public bool IsDeleted { get; private set; }

    public void MarkUpdated() => UpdatedAtUtc = DateTime.UtcNow;

    public void SoftDelete()
    {
        IsDeleted = true;
        MarkUpdated();
    }
}

public interface IAggregateRoot;
