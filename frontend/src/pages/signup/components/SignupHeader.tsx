type Props = { title: string; subtitle: string; isModal: boolean };
export function SignupHeader({ title, subtitle, isModal }: Props) {
  return (
    <>
      {!isModal && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {/* LanguageToggle is rendered at page-level in original layout */}
        </div>
      )}
      <div className="stakr-signup__header" style={{ minHeight: '5.6rem', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', lineHeight: 1.05, color: '#000' }}>
          {title}
          <span style={{ color: '#bff104' }}>.</span>
        </h1>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', lineHeight: 1.3, color: '#666', fontWeight: 600 }}>{subtitle}</p>
      </div>
    </>
  );
}

