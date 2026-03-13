interface ChartsPlaceholderCardProps {
  title: string;
  placeholder: string;
}

export default function ChartsPlaceholderCard({ title, placeholder }: ChartsPlaceholderCardProps) {
  return (
    <section className="dashboard-card charts">
      <h2 className="dashboard-card__title">{title}</h2>
      <div className="charts__body">
        <div className="charts__state">{placeholder}</div>
      </div>
    </section>
  );
}

