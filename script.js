const aprobados = new Set(JSON.parse(localStorage.getItem("aprobados") || "[]"));

function toggleRamo(id) {
  const el = document.getElementById(id);
  if (el.classList.contains("bloqueado")) return;

  if (aprobados.has(id)) {
    aprobados.delete(id);
  } else {
    aprobados.add(id);
  }

  localStorage.setItem("aprobados", JSON.stringify([...aprobados]));
  actualizarEstado();
}

function actualizarEstado() {
  document.querySelectorAll(".ramo").forEach(ramo => {
    const id = ramo.id;
    const prerreqs = ramo.dataset.prerreq.split(',').filter(Boolean);
    const cumplido = prerreqs.every(p => aprobados.has(p));

    if (aprobados.has(id)) {
      ramo.classList.add("aprobado");
      ramo.classList.remove("bloqueado");
    } else if (prerreqs.length && !cumplido) {
      ramo.classList.remove("aprobado");
      ramo.classList.add("bloqueado");
    } else {
      ramo.classList.remove("aprobado", "bloqueado");
    }
  });
}

actualizarEstado();
