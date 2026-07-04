using Microsoft.EntityFrameworkCore;
using Spends360.Domain.Entities;

namespace Spends360.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id").UseIdentityByDefaultColumn();
            entity.Property(x => x.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Password).HasColumnName("password").HasMaxLength(255).IsRequired();
            entity.Property(x => x.IsVerified).HasColumnName("is_verified").HasDefaultValue(false);
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            entity.Property(x => x.CreatedBy).HasColumnName("created_by");
            entity.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            entity.Property(x => x.Otp).HasColumnName("otp").HasMaxLength(6);
            entity.Property(x => x.OtpExpiresAt).HasColumnName("otp_expires_at");
            entity.Property(x => x.LastLoginAt).HasColumnName("last_login_at");
            entity.Property(x => x.LastLoginIp).HasColumnName("last_login_ip").HasMaxLength(45);
        });
    }
}
