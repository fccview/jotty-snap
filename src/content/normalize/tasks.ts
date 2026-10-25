import { make, type NormalizeCtx, type NormalizeStep } from "@/content/normalize/types";

export const TASK_LIST_TYPE = "taskList";
export const TASK_ITEM_TYPE = "taskItem";

const checkboxOf = (item: Element) =>
  item.querySelector<HTMLInputElement>(':scope > input[type="checkbox"], :scope > p > input[type="checkbox"], :scope > label > input[type="checkbox"]');

const toTaskItem = (item: HTMLLIElement, box: HTMLInputElement, ctx: NormalizeCtx) => {
  const checked = box.checked || box.hasAttribute("checked");
  box.remove();
  const next = make(ctx, "li", {
    "data-type": TASK_ITEM_TYPE,
    "data-checked": String(checked),
  });
  const body = make(ctx, "p");
  const nested: Element[] = [];
  for (const child of Array.from(item.childNodes)) {
    if (child instanceof Element && (child.tagName === "UL" || child.tagName === "OL")) nested.push(child);
    else body.appendChild(child);
  }
  body.innerHTML = body.innerHTML.trim();
  next.append(body, ...nested);
  return next;
};

export const tasks: NormalizeStep = (root, ctx) => {
  for (const list of Array.from(root.querySelectorAll("ul, ol"))) {
    const items = Array.from(list.children).filter((child): child is HTMLLIElement => child.tagName === "LI");
    if (items.length === 0 || !items.every((item) => checkboxOf(item))) continue;
    const next = make(ctx, "ul", { "data-type": TASK_LIST_TYPE });
    for (const item of items) {
      const box = checkboxOf(item);
      if (box) next.appendChild(toTaskItem(item, box, ctx));
    }
    list.replaceWith(next);
  }
};
