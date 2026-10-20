using Microsoft.EntityFrameworkCore;
using Vapless.Domain.Entities;

namespace Vapless.Infrastructure.Data;

public sealed class VaplessDbContext : DbContext
{
    public VaplessDbContext(DbContextOptions<VaplessDbContext> options) : base(options)
    {
    }

    public DbSet<UserProgress> UserProgresses => Set<UserProgress>();
    public DbSet<Craving> Cravings => Set<Craving>();
    public DbSet<RiskSurvey> RiskSurveys => Set<RiskSurvey>();
    public DbSet<HackCard> HackCards => Set<HackCard>();
    public DbSet<SocialScenario> SocialScenarios => Set<SocialScenario>();
    public DbSet<SupportHotline> SupportHotlines => Set<SupportHotline>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserProgress>(entity =>
        {
            entity.ToTable("UserProgresses");
            entity.Property(p => p.Alias).HasMaxLength(40).IsRequired();
            entity.Property(p => p.DailyCostCop).HasConversion<double>();
            entity.Property(p => p.NicotineMgPerPod).HasConversion<double>();
            entity.Property(p => p.PrimaryDevice).HasConversion<int>();
            entity.HasIndex(p => p.IsActive);
        });

        modelBuilder.Entity<Craving>(entity =>
        {
            entity.ToTable("Cravings");
            entity.Property(c => c.Intensity).HasConversion<int>();
            entity.Property(c => c.Trigger).HasConversion<int>();
            entity.Property(c => c.StrategyUsed).HasMaxLength(80);
            entity.HasOne(c => c.UserProgress)
                .WithMany()
                .HasForeignKey(c => c.UserProgressId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(c => new { c.UserProgressId, c.OccurredAt });
        });

        modelBuilder.Entity<RiskSurvey>(entity =>
        {
            entity.ToTable("RiskSurveys");
            entity.Property(s => s.Comuna).HasConversion<int>();
            entity.Property(s => s.PrimaryDevice).HasConversion<int>();
            entity.Property(s => s.Trigger).HasConversion<int>();
            entity.Property(s => s.FamilyContext).HasConversion<int>();
            entity.HasIndex(s => s.Comuna);
            entity.HasIndex(s => s.SubmittedAt);
        });

        modelBuilder.Entity<HackCard>(entity =>
        {
            entity.ToTable("HackCards");
            entity.Property(c => c.Category).HasConversion<int>();
            entity.Property(c => c.Statement).HasMaxLength(240).IsRequired();
            entity.Property(c => c.Explanation).HasMaxLength(600).IsRequired();
            entity.HasIndex(c => new { c.Category, c.SortOrder }).IsUnique();
        });

        modelBuilder.Entity<SocialScenario>(entity =>
        {
            entity.ToTable("SocialScenarios");
            entity.Property(s => s.Trigger).HasConversion<int>();
            entity.Property(s => s.Title).HasMaxLength(120).IsRequired();
            entity.Property(s => s.PeerPhrase).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<SupportHotline>(entity =>
        {
            entity.ToTable("SupportHotlines");
            entity.Property(h => h.Name).HasMaxLength(120).IsRequired();
            entity.Property(h => h.Phone).HasMaxLength(40).IsRequired();
        });

        base.OnModelCreating(modelBuilder);
    }
}
