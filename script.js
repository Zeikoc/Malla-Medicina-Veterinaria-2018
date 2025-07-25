// Estado global de la aplicación
const aprobados = new Set(JSON.parse(localStorage.getItem("aprobados") || "[]"));
const totalRamos = document.querySelectorAll('.ramo').length;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  actualizarEstado();
  actualizarProgreso();
  
  // Agregar efectos de entrada
  setTimeout(() => {
    document.querySelectorAll('.semestre').forEach((semestre, index) => {
      semestre.style.animationDelay = `${index * 0.1}s`;
    });
  }, 100);
});

// Función principal para alternar estado de ramo
function toggleRamo(id) {
  const elemento = document.getElementById(id);
  
  // Verificar si el ramo está bloqueado
  if (elemento.classList.contains("bloqueado")) {
    mostrarNotificacion("Este ramo está bloqueado. Debes aprobar los prerrequisitos primero.", "warning");
    return;
  }

  // Alternar estado
  if (aprobados.has(id)) {
    aprobados.delete(id);
    mostrarNotificacion(`${elemento.querySelector('h3').textContent} marcado como no aprobado`, "info");
  } else {
    aprobados.add(id);
    mostrarNotificacion(`¡${elemento.querySelector('h3').textContent} aprobado!`, "success");
  }

  // Guardar en localStorage
  localStorage.setItem("aprobados", JSON.stringify([...aprobados]));
  
  // Actualizar interfaz
  actualizarEstado();
  actualizarProgreso();
  
  // Efecto visual
  elemento.style.transform = 'scale(1.05)';
  setTimeout(() => {
    elemento.style.transform = '';
  }, 200);
}

// Actualizar estado visual de todos los ramos
function actualizarEstado() {
  document.querySelectorAll(".ramo").forEach(ramo => {
    const id = ramo.id;
    const prerrequisitos = ramo.dataset.prerreq.split(',').filter(Boolean);
    const prerrequisitosCompletos = prerrequisitos.every(prerreq => aprobados.has(prerreq));

    // Limpiar clases existentes
    ramo.classList.remove("aprobado", "bloqueado");

    if (aprobados.has(id)) {
      // Ramo aprobado - morado con tachado
      ramo.classList.add("aprobado");
    } else if (prerrequisitos.length > 0 && !prerrequisitosCompletos) {
      // Ramo bloqueado - gris
      ramo.classList.add("bloqueado");
      
      // Agregar tooltip con prerrequisitos faltantes
      const faltantes = prerrequisitos.filter(prerreq => !aprobados.has(prerreq));
      const nombresFaltantes = faltantes.map(id => {
        const elemento = document.getElementById(id);
        return elemento ? elemento.querySelector('h3').textContent : id;
      });
      
      ramo.title = `Prerrequisitos faltantes: ${nombresFaltantes.join(', ')}`;
    } else {
      // Ramo disponible - verde claro
      ramo.title = "Haz click para marcar como aprobado";
    }
  });
}

// Actualizar contador de progreso
function actualizarProgreso() {
  const aprobadosCount = aprobados.size;
  const porcentaje = Math.round((aprobadosCount / totalRamos) * 100);
  
  document.getElementById('progress-text').textContent = 
    `Ramos aprobados: ${aprobadosCount}/${totalRamos} (${porcentaje}%)`;
  
  // Agregar barra de progreso si no existe
  let progressInfo = document.querySelector('.progress-info');
  let progressBar = document.querySelector('.progress-bar');
  
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    progressInfo.appendChild(progressBar);
  }
  
  const progressFill = document.querySelector('.progress-fill');
  progressFill.style.width = `${porcentaje}%`;
  
  // Cambiar color según progreso
  if (porcentaje < 30) {
    progressFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
  } else if (porcentaje < 70) {
    progressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
  } else {
    progressFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
  }
}

// Reiniciar progreso
function resetProgress() {
  if (confirm('¿Estás seguro de que quieres reiniciar todo el progreso? Esta acción no se puede deshacer.')) {
    aprobados.clear();
    localStorage.removeItem("aprobados");
    actualizarEstado();
    actualizarProgreso();
    mostrarNotificacion("Progreso reiniciado exitosamente", "info");
  }
}

// Exportar progreso
function exportProgress() {
  const ramosAprobados = [...aprobados].map(id => {
    const elemento = document.getElementById(id);
    return {
      id: id,
      nombre: elemento.querySelector('h3').textContent,
      creditos: elemento.querySelector('.creditos').textContent,
      semestre: elemento.closest('.semestre').querySelector('h2').textContent
    };
  });
  
  const data = {
    fecha: new Date().toLocaleDateString('es-ES'),
    totalRamos: totalRamos,
    ramosAprobados: ramosAprobados.length,
    porcentajeCompletado: Math.round((ramosAprobados.length / totalRamos) * 100),
    ramos: ramosAprobados
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `progreso_malla_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  mostrarNotificacion("Progreso exportado exitosamente", "success");
}

// Sistema de notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Remover notificación existente si hay una
  const existente = document.querySelector('.notificacion');
  if (existente) {
    existente.remove();
  }
  
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion ${tipo}`;
  notificacion.textContent = mensaje;
  
  // Estilos de la notificación
  Object.assign(notificacion.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    zIndex: '1000',
    maxWidth: '300px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease'
  });
  
  // Colores según tipo
  const colores = {
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e74c3c',
    info: '#3498db'
  };
  
  notificacion.style.backgroundColor = colores[tipo] || colores.info;
  
  document.body.appendChild(notificacion);
  
  // Animación de entrada
  setTimeout(() => {
    notificacion.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto-remover después de 3 segundos
  setTimeout(() => {
    notificacion.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notificacion.parentNode) {
        notificacion.remove();
      }
    }, 300);
  }, 3000);
}

// Funciones de utilidad para análisis
function obtenerEstadisticas() {
  const stats = {
    totalRamos: totalRamos,
    ramosAprobados: aprobados.size,
    porcentajeCompletado: Math.round((aprobados.size / totalRamos) * 100),
    ramosPorSemestre: {}
  };
  
  document.querySelectorAll('.semestre').forEach(semestre => {
    const numeroSemestre = semestre.querySelector('h2').textContent;
    const ramosEnSemestre = semestre.querySelectorAll('.ramo');
    const ramosAprobadosEnSemestre = [...ramosEnSemestre].filter(ramo => 
      aprobados.has(ramo.id)
    ).length;
    
    stats.ramosPorSemestre[numeroSemestre] = {
      total: ramosEnSemestre.length,
      aprobados: ramosAprobadosEnSemestre,
      porcentaje: Math.round((ramosAprobadosEnSemestre / ramosEnSemestre.length) * 100)
    };
  });
  
  return stats;
}

// Función para obtener ramos disponibles para tomar
function obtenerRamosDisponibles() {
  const disponibles = [];
  
  document.querySelectorAll('.ramo').forEach(ramo => {
    if (!ramo.classList.contains('aprobado') && !ramo.classList.contains('bloqueado')) {
      disponibles.push({
        id: ramo.id,
        nombre: ramo.querySelector('h3').textContent,
        creditos: ramo.querySelector('.creditos').textContent,
        semestre: ramo.closest('.semestre').querySelector('h2').textContent
      });
    }
  });
  
  return disponibles;
}

// Función para simular carga de datos (si se implementa importación)
function importarProgreso(archivoJSON) {
  try {
    const data = JSON.parse(archivoJSON);
    if (data.ramos && Array.isArray(data.ramos)) {
      aprobados.clear();
      data.ramos.forEach(ramo => {
        if (ramo.id) {
          aprobados.add(ramo.id);
        }
      });
      
      localStorage.setItem("aprobados", JSON.stringify([...aprobados]));
      actualizarEstado();
      actualizarProgreso();
      mostrarNotificacion("Progreso importado exitosamente", "success");
    }
  } catch (error) {
    mostrarNotificacion("Error al importar el archivo", "error");
    console.error("Error de importación:", error);
  }
}

// Atajos de teclado
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + R para reiniciar
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    resetProgress();
  }
  
  // Ctrl/Cmd + E para exportar
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    exportProgress();
  }
  
  // Escape para cerrar notificaciones
  if (e.key === 'Escape') {
    const notificacion = document.querySelector('.notificacion');
    if (notificacion) {
      notificacion.style.transform = 'translateX(100%)';
      setTimeout(() => notificacion.remove(), 300);
    }
  }
});

// Exponer funciones útiles al contexto global para debugging
window.mallaUtils = {
  obtenerEstadisticas,
  obtenerRamosDisponibles,
  importarProgreso,
  aprobados: () => [...aprobados]
};
