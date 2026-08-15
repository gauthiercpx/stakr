import FadeText from '../../../components/FadeText';

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
        <FadeText>{greeting}</FadeText> <FadeText as="span" className="dashboard-hero__name">{displayName}</FadeText> 👋
      </h1>
      <p className="dashboard-hero__subtitle"><FadeText>{subtitle}</FadeText></p>
      <div className={`dashboard-hero__status ${isActive ? 'is-active' : 'is-inactive'}`}>
        <FadeText>{isActive ? activeLabel : inactiveLabel}</FadeText>
      </div>
    </section>
  );
}

