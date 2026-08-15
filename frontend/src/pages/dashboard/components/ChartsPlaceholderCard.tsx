import FadeText from '../../../components/FadeText';

interface ChartsPlaceholderCardProps {
  title: string;
  placeholder: string;
}

export default function ChartsPlaceholderCard({ title, placeholder }: ChartsPlaceholderCardProps) {
  return (
    <section className="dashboard-card charts">
      <h2 className="dashboard-card__title"><FadeText>{title}</FadeText></h2>
      <div className="charts__body">
        <div className="charts__state"><FadeText>{placeholder}</FadeText></div>
      </div>
    </section>
  );
}

