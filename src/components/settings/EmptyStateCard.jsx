const EmptyStateCard = ({ title, description, action }) => (
  <div className="rounded-lg border border-[#ebebeb] bg-white p-6 text-center shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
    <p className="text-base font-semibold text-[#171717]">{title}</p>
    {description ? <p className="mx-auto mt-2 max-w-md text-sm text-[#4d4d4d]">{description}</p> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export default EmptyStateCard;