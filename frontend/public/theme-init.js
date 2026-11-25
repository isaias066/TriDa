try {
  const theme = localStorage.getItem("trida_theme");
  document.documentElement.dataset.theme =
    theme === "light" || theme === "dark" ? theme : "dark";
} catch (error) {
  console.warn(
    "No se pudo leer el tema guardado; se usará el tema oscuro.",
    error,
  );
  document.documentElement.dataset.theme = "dark";
}
