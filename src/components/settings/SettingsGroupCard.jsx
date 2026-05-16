const SettingsGroupCard = ({ title, description, danger = false, children }) => (
  <section
    className={`rounded-lg border bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)] ${
      danger ? "border-[#f7d4d6]" : "border-[#ebebeb]"
    }`}
  >
    <div className={`border-b px-4 py-4 sm:px-5 ${danger ? "border-[#f7d4d6] bg-[#fff7f7]" : "border-[#ebebeb]"}`}>
      <h3 className="text-base font-semibold text-[#171717]">{title}</h3>
      {description ? <p className="mt-1 text-sm text-[#4d4d4d]">{description}</p> : null}
    </div>
    <div className="divide-y divide-[#ebebeb]">{children}</div>
  </section>
);

export default SettingsGroupCard;