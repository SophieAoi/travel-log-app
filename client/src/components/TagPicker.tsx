import { TAGS, type TagCategory } from "../data/tags";

interface TagPickerProps {
  value: TagCategory[];
  onChange: (tags: TagCategory[]) => void;
}

export function TagPicker({ value, onChange }: TagPickerProps) {
  function toggle(tag: TagCategory) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  }

  return (
    <div className="tag-picker">
      {TAGS.map((t) => {
        const Icon = t.icon;
        const active = value.includes(t.value);
        return (
          <button
            key={t.value}
            type="button"
            className={`tag-chip ${active ? "tag-chip-active" : ""}`}
            onClick={() => toggle(t.value)}
            aria-pressed={active}
          >
            <Icon size={13} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
