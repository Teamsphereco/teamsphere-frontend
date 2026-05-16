import {
  ActionButton,
  RangeControl,
  SegmentedControl,
  SelectControl,
  StatusPill,
  ToggleSwitch,
} from "./SettingsControls";

const SettingsRow = ({ row, value, onChange, onAction, busy = false }) => {
  const renderControl = () => {
    const control = row.control;

    if (!control) {
      return null;
    }

    if (control.type === "toggle") {
      return <ToggleSwitch checked={Boolean(value)} onChange={onChange} label={row.title} />;
    }

    if (control.type === "select") {
      return <SelectControl value={value} options={control.options} onChange={onChange} label={row.title} />;
    }

    if (control.type === "segmented") {
      return <SegmentedControl value={value} options={control.options} onChange={onChange} label={row.title} />;
    }

    if (control.type === "range") {
      return (
        <RangeControl
          value={value}
          min={control.min}
          max={control.max}
          step={control.step}
          suffix={control.suffix || ""}
          onChange={onChange}
          label={row.title}
        />
      );
    }

    if (control.type === "button") {
      return (
        <ActionButton
          variant={control.variant}
          disabled={busy}
          onClick={() => onAction(control.action, row)}
        >
          {busy ? "Working..." : control.label}
        </ActionButton>
      );
    }

    if (control.type === "status") {
      return <StatusPill label={control.label} tone={control.tone} />;
    }

    return null;
  };

  return (
    <div className="group flex min-h-[72px] flex-col gap-3 px-4 py-4 transition hover:bg-[#fafafa] sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-[#171717]">{row.title}</h4>
          {row.badge ? <StatusPill label={row.badge} tone="neutral" /> : null}
          {row.metadata ? (
            <span className="font-mono text-[11px] text-[#888888]">{row.metadata}</span>
          ) : null}
        </div>
        {row.description ? <p className="mt-1 max-w-2xl text-sm leading-5 text-[#4d4d4d]">{row.description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center justify-start sm:justify-end">{renderControl()}</div>
    </div>
  );
};

export default SettingsRow;