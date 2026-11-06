import { defineBoot } from "#q-app/wrappers";
import { usePanelsStore } from "@/stores/panels";

function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.closest) return false;
  return Boolean(el.closest("input, textarea, [contenteditable='true']"));
}

export default defineBoot(() => {
  document.addEventListener(
    "contextmenu",
    (event) => {
      if (isEditable(event.target)) return;
      event.preventDefault();
    },
    { capture: true },
  );

  document.addEventListener("dragstart", (event) => {
    const el = event.target as HTMLElement | null;
    if (el && el.tagName === "IMG") event.preventDefault();
  });

  window.addEventListener(
    "keydown",
    (event) => {
      const key = event.key.toLowerCase();

      // Перехватываем Ctrl+F / Cmd+F до того, как браузер запустит встроенный поиск по буквам на странице
      if ((event.ctrlKey || event.metaKey) && key === "f") {
        event.preventDefault();
        event.stopPropagation();
        const selectedText = window.getSelection()?.toString().trim();
        window.dispatchEvent(
          new CustomEvent("app:open-search", {
            detail: { selectedText: selectedText || undefined },
          }),
        );
        return;
      }

      const reload =
        key === "f5" ||
        ((event.ctrlKey || event.metaKey) && key === "r");
      if (!reload) return;
      const panels = usePanelsStore();
      if (panels.mini || panels.hidden) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true },
  );
});
