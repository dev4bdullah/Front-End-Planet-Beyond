/* A second lazy module, so you can see two independent chunks arrive separately. */

console.log("charts.js downloaded");

export function barChart(entries, max) {
  return `
    <ul class="bars">
      ${entries
        .map(
          ([label, value]) => `
        <li>
          <span class="bars__label">${label}</span>
          <span class="bars__track">
            <span class="bars__fill" style="width:${(value / max) * 100}%"></span>
          </span>
          <span class="bars__value">${value}</span>
        </li>`
        )
        .join("")}
    </ul>`;
}
