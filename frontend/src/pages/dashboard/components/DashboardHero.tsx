interface DashboardHeroProps {
  greeting: string;
  subtitle: string;
  displayName: string;
  isActive: boolean;
  activeLabel: string;
  inactiveLabel: string;
}

export default function DashboardHero({
  greeting,
  subtitle,
  displayName,
  isActive,
  activeLabel,
  inactiveLabel,
}: DashboardHeroProps) {
  return (
    <section className="dashboard-hero">
      <h1 className="dashboard-hero__title">
        {greeting} <span className="dashboard-hero__name">{displayName}</span> 👋
      </h1>
      <p className="dashboard-hero__subtitle">{subtitle}</p>
      <div className={`dashboard-hero__status ${isActive ? 'is-active' : 'is-inactive'}`}>
        {isActive ? activeLabel : inactiveLabel}
      </div>
    </section>
  );
}

