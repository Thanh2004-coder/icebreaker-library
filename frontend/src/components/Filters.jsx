const HIDDEN_CONTEXT_SLUGS = new Set(["online", "offline"]);

export default function Filters({ filters, selected, onChange }) {
  if (!filters) return null;

  const contexts = (filters.contexts || []).filter((item) => {
    const slug = (item.value || "").toLowerCase();
    const label = (item.label || "").toLowerCase();
    if (HIDDEN_CONTEXT_SLUGS.has(slug)) return false;
    return !label.includes("online") && !label.includes("offline") && !label.includes("trực tuyến") && !label.includes("zoom") && !label.includes("discord");
  });

  const toggleMulti = (key, value) => {
    const current = selected[key] || [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    onChange({ ...selected, [key]: next });
  };

  return (
    <section className="filters" aria-label="Bộ lọc">
      <fieldset>
        <legend>Số người</legend>
        <div className="chips">
          {filters.players.map((item) => (
            <label key={item.value} className={selected.players === item.value ? "chip on" : "chip"}>
              <input
                type="radio"
                name="players"
                value={item.value}
                checked={selected.players === item.value}
                onChange={() => onChange({ ...selected, players: item.value })}
              />
              {item.label}
            </label>
          ))}
          <button type="button" className="chip ghost" onClick={() => onChange({ ...selected, players: "" })}>
            Tất cả
          </button>
        </div>
      </fieldset>

      {contexts.length > 0 ? (
      <fieldset>
        <legend>Bối cảnh</legend>
        <div className="chips">
          {contexts.map((item) => (
            <label key={item.value} className={selected.context === item.value ? "chip on" : "chip"}>
              <input
                type="radio"
                name="context"
                value={item.value}
                checked={selected.context === item.value}
                onChange={() => onChange({ ...selected, context: item.value })}
              />
              {item.label}
            </label>
          ))}
          <button type="button" className="chip ghost" onClick={() => onChange({ ...selected, context: "" })}>
            Tất cả
          </button>
        </div>
      </fieldset>
      ) : null}

      {filters.purposes?.length > 0 ? (
      <fieldset>
        <legend>Mục đích</legend>
        <div className="chips">
          {filters.purposes.map((item) => (
            <label key={item.value} className={selected.purposes.includes(item.value) ? "chip on" : "chip"}>
              <input
                type="checkbox"
                checked={selected.purposes.includes(item.value)}
                onChange={() => toggleMulti("purposes", item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>
      ) : null}

      <fieldset>
        <legend>Thời gian</legend>
        <div className="chips">
          {filters.durations.map((item) => (
            <label key={item.value} className={selected.duration === item.value ? "chip on" : "chip"}>
              <input
                type="radio"
                name="duration"
                value={item.value}
                checked={selected.duration === item.value}
                onChange={() => onChange({ ...selected, duration: item.value })}
              />
              {item.label}
            </label>
          ))}
          <button type="button" className="chip ghost" onClick={() => onChange({ ...selected, duration: "" })}>
            Tất cả
          </button>
        </div>
      </fieldset>
    </section>
  );
}
