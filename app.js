// ===== Helpers =====
const { useEffect, useMemo, useState, useRef } = React;
const e = React.createElement;

const LS_KEY = 'agenda_estudiantes_sin_google_v5';
const TEACHER_LS_KEY = 'teacher_profile_v1';

// Ahora la sesión proviene EXCLUSIVAMENTE de Supabase (auth_supabase.js)
function loadSession() {
  try {
    const raw = localStorage.getItem('session_user_v1');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function uid(prefix) {
  prefix = prefix || 'id';
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

function safeStats(stats) {
  return stats && typeof stats === 'object'
    ? stats
    : { present: 0, absent: 0, later: 0 };
}

function pct(stats) {
  const s = safeStats(stats);
  const d = (s.present || 0) + (s.absent || 0);
  return d ? Math.round((s.present / d) * 100) : 0;
}

function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function byKeyAsc(key) {
  return (a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0);
}

function sortByName(arr) {
  return [...arr].sort((a, b) =>
    (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
  );
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ===== Modal Utility =====
function Modal({ title, children, onClose }) {
  return e(
    'div',
    {
      className:
        'fixed inset-0 flex items-center justify-center z-50 p-4 bg-[rgba(0,0,0,0.4)]',
      onClick: onClose,
    },
    e(
      'div',
      {
        className:
          'bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative',
        onClick: (ev) => ev.stopPropagation(),
      },
      e(
        'div',
        { className: 'mb-4 flex justify-between items-center' },
        e(
          'h2',
          { className: 'text-xl font-semibold text-slate-800' },
          title || ''
        ),
        e(
          'button',
          {
            className: 'text-slate-500 hover:text-slate-700',
            onClick: onClose,
          },
          '✕'
        )
      ),
      children
    )
  );
}

// ===== Storage wrapper =====
function loadData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { courses: [] };
    const data = JSON.parse(raw);
    if (!data.courses) data.courses = [];
    return data;
  } catch {
    return { courses: [] };
  }
}

function saveData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ===== Teacher Profile =====
function loadTeacherProfile() {
  try {
    const raw = localStorage.getItem(TEACHER_LS_KEY);
    if (!raw) return { nombre: '' };
    return JSON.parse(raw);
  } catch {
    return { nombre: '' };
  }
}

function saveTeacherProfile(p) {
  localStorage.setItem(TEACHER_LS_KEY, JSON.stringify(p));
}

// ===== Components =====

// ------- TeacherProfileModal -------
function TeacherProfileModal({ profile, onSave, onClose }) {
  const [nombre, setNombre] = useState(profile.nombre || '');

  function submit() {
    onSave({ nombre });
    onClose();
  }

  return e(
    Modal,
    { title: 'Mi perfil docente', onClose },
    e(
      'div',
      { className: 'space-y-4' },
      e(
        'label',
        { className: 'block text-sm text-slate-700' },
        'Nombre del docente:',
        e('input', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: nombre,
          onChange: (ev) => setNombre(ev.target.value),
        })
      ),
      e(
        'button',
        {
          className:
            'bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: submit,
        },
        'Guardar'
      )
    )
  );
}

// ------- NewCourseModal -------
function NewCourseModal({ onSave, onClose }) {
  const [nombre, setNombre] = useState('');
  const [turno, setTurno] = useState('');
  const [dias, setDias] = useState([]);

  function toggleDia(k) {
    setDias((old) =>
      old.includes(k) ? old.filter((d) => d !== k) : [...old, k]
    );
  }

  function submit() {
    if (!nombre.trim()) return;
    const nuevo = {
      id: uid('course'),
      nombre,
      turno,
      dias,
      estudiantes: [],
    };
    onSave(nuevo);
    onClose();
  }

  return e(
    Modal,
    { title: 'Nuevo curso', onClose },
    e(
      'div',
      { className: 'space-y-4' },
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Nombre del curso:'),
        e('input', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: nombre,
          onChange: (ev) => setNombre(ev.target.value),
        })
      ),
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Turno:'),
        e('select', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value:
// ------- EditCourseModal -------
function EditCourseModal({ course, onSave, onClose }) {
  const [nombre, setNombre] = useState(course.nombre || '');
  const [turno, setTurno] = useState(course.turno || '');
  const [dias, setDias] = useState(course.dias || []);

  function toggleDia(k) {
    setDias((old) =>
      old.includes(k) ? old.filter((d) => d !== k) : [...old, k]
    );
  }

  function submit() {
    const updated = {
      ...course,
      nombre,
      turno,
      dias,
    };
    onSave(updated);
    onClose();
  }

  return e(
    Modal,
    { title: 'Editar curso', onClose },
    e(
      'div',
      { className: 'space-y-4' },
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Nombre del curso:'),
        e('input', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: nombre,
          onChange: (ev) => setNombre(ev.target.value),
        })
      ),
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Turno:'),
        e('select', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: turno,
          onChange: (ev) => setTurno(ev.target.value),
        },
          e('option', { value: '' }, 'Seleccionar'),
          e('option', { value: 'Mañana' }, 'Mañana'),
          e('option', { value: 'Tarde' }, 'Tarde'),
          e('option', { value: 'Noche' }, 'Noche')
        )
      ),
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Días:'),
        e('div', { className: 'grid grid-cols-3 gap-2 mt-2' },
          [
            ['lun', 'Lunes'],
            ['mar', 'Martes'],
            ['mie', 'Miércoles'],
            ['jue', 'Jueves'],
            ['vie', 'Viernes'],
            ['sab', 'Sábado'],
          ].map(([k, lab]) =>
            e('label', { key: k, className: 'flex items-center gap-2' },
              e('input', {
                type: 'checkbox',
                checked: dias.includes(k),
                onChange: () => toggleDia(k),
              }),
              lab
            )
          )
        )
      ),
      e(
        'button',
        {
          className:
            'bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: submit,
        },
        'Guardar cambios'
      )
    )
  );
}

// ------- NewStudentModal -------
function NewStudentModal({ onSave, onClose }) {
  const [nombre, setNombre] = useState('');

  function submit() {
    if (!nombre.trim()) return;
    const nuevo = {
      id: uid('stu'),
      nombre,
      stats: { present: 0, absent: 0, later: 0 },
      asistencias: {},
      notas: [],
    };
    onSave(nuevo);
    onClose();
  }

  return e(
    Modal,
    { title: 'Nuevo estudiante', onClose },
    e(
      'div',
      { className: 'space-y-4' },
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Nombre del estudiante:'),
        e('input', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: nombre,
          onChange: (ev) => setNombre(ev.target.value),
        })
      ),
      e(
        'button',
        {
          className:
            'bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: submit,
        },
        'Agregar'
      )
    )
  );
}

// ------- EditStudentModal -------
function EditStudentModal({ student, onSave, onClose }) {
  const [nombre, setNombre] = useState(student.nombre || '');

  function submit() {
    const updated = {
      ...student,
      nombre,
    };
    onSave(updated);
    onClose();
  }

  return e(
    Modal,
    { title: 'Editar estudiante', onClose },
    e(
      'div',
      { className: 'space-y-4' },
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Nombre:'),
        e('input', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: nombre,
          onChange: (ev) => setNombre(ev.target.value),
        })
      ),
      e(
        'button',
        {
          className:
            'bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: submit,
        },
        'Guardar'
      )
    )
  );
}

// ------- AttendanceModal -------
function AttendanceModal({ student, course, onSave, onClose }) {
  const [fecha, setFecha] = useState(todayStr());
  const [estado, setEstado] = useState('present');

  function submit() {
    const updated = deepCopy(student);
    updated.asistencias = updated.asistencias || {};
    updated.asistencias[fecha] = estado;

    const st = updated.stats || { present: 0, absent: 0, later: 0 };

    // recomputar stats completos
    let p = 0, a = 0, l = 0;
    Object.values(updated.asistencias).forEach((x) => {
      if (x === 'present') p++;
      else if (x === 'absent') a++;
      else if (x === 'later') l++;
    });

    updated.stats = { present: p, absent: a, later: l };

    onSave(updated);
    onClose();
  }

  return e(
    Modal,
    { title: 'Registrar asistencia', onClose },
    e(
      'div',
      { className: 'space-y-4' },
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Fecha:'),
        e('input', {
          type: 'date',
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: fecha,
          onChange: (ev) => setFecha(ev.target.value),
        })
      ),
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Estado:'),
        e('select', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: estado,
          onChange: (ev) => setEstado(ev.target.value),
        },
          e('option', { value: 'present' }, 'Presente'),
          e('option', { value: 'absent' }, 'Ausente'),
          e('option', { value: 'later' }, 'Tarde')
        )
      ),
      e(
        'button',
        {
          className:
            'bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: submit,
        },
        'Guardar'
      )
    )
  );
}

// ------- GradesModal -------
function GradesModal({ student, onSave, onClose }) {
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [fecha, setFecha] = useState(todayStr());

  function addGrade() {
    if (!titulo.trim()) return;
    const grade = {
      id: uid('grade'),
      titulo,
      valor,
      fecha,
    };
    const updated = deepCopy(student);
    updated.notas = updated.notas || [];
    updated.notas.push(grade);
    onSave(updated);
  }

  return e(
    Modal,
    { title: 'Notas del estudiante', onClose },
    e(
      'div',
      { className: 'space-y-4' },
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Título:'),
        e('input', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: titulo,
          onChange: (ev) => setTitulo(ev.target.value),
        })
      ),
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Valor:'),
        e('input', {
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: valor,
          onChange: (ev) => setValor(ev.target.value),
        })
      ),
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700' }, 'Fecha:'),
        e('input', {
          type: 'date',
          className:
            'mt-1 w-full rounded border-slate-300 shadow-sm focus:border-violet-600 focus:ring-violet-600',
          value: fecha,
          onChange: (ev) => setFecha(ev.target.value),
        })
      ),
      e(
        'button',
        {
          className:
            'bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: addGrade,
        },
        'Agregar nota'
      ),

      e('hr', { className: 'my-4 border-slate-300' }),

      e(
        'table',
        { className: 'w-full text-sm' },
        e(
          'thead',
          null,
          e(
            'tr',
            null,
            e('th', { className: 'text-left py-1' }, 'Título'),
            e('th', { className: 'text-left py-1' }, 'Valor'),
            e('th', { className: 'text-left py-1' }, 'Fecha')
          )
        ),
        e(
          'tbody',
          null,
          ...(student.notas && student.notas.length
            ? student.notas.map((g) =>
                e(
                  'tr',
                  { key: g.id },
                  e('td', { className: 'py-1' }, g.titulo),
                  e('td', { className: 'py-1' }, g.valor),
                  e('td', { className: 'py-1' }, g.fecha)
                )
              )
            : [
                e(
                  'tr',
                  { key: 'empty' },
                  e('td', { colSpan: 3, className: 'py-2 text-slate-500' }, 'Sin notas')
                ),
              ])
        )
      )
    )
  );
}
// ------- CourseView -------
function CourseView({ course, onBack, onUpdateCourse }) {
  const [data, setData] = useState(() => loadData());
  const [modal, setModal] = useState(null);

  // sync course reference with localStorage updates
  const courseData = useMemo(() => {
    return data.courses.find((c) => c.id === course.id) || course;
  }, [data, course.id]);

  function updateCourse(updated) {
    const newData = deepCopy(data);
    const idx = newData.courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      newData.courses[idx] = updated;
      setData(newData);
      saveData(newData);
      onUpdateCourse && onUpdateCourse(updated);
    }
  }

  function addStudent(stu) {
    const updated = deepCopy(courseData);
    updated.estudiantes.push(stu);
    updateCourse(updated);
  }

  function updateStudent(stu) {
    const updated = deepCopy(courseData);
    const idx = updated.estudiantes.findIndex((s) => s.id === stu.id);
    if (idx >= 0) {
      updated.estudiantes[idx] = stu;
      updateCourse(updated);
    }
  }

  function removeStudent(stu) {
    if (!confirm('¿Eliminar estudiante?')) return;
    const updated = deepCopy(courseData);
    updated.estudiantes = updated.estudiantes.filter((s) => s.id !== stu.id);
    updateCourse(updated);
  }

  const estudiantesOrdenados = useMemo(() => {
    return sortByName(courseData.estudiantes || []);
  }, [courseData.estudiantes]);

  return e(
    'div',
    { className: 'p-4 space-y-4' },

    e(
      'div',
      { className: 'flex justify-between items-center' },
      e(
        'button',
        {
          className:
            'px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700',
          onClick: onBack,
        },
        '← Volver'
      ),
      e(
        'h2',
        { className: 'text-xl font-semibold text-slate-800' },
        courseData.nombre
      ),
      e(
        'button',
        {
          className:
            'px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700',
          onClick: () =>
            setModal(
              e(EditCourseModal, {
                course: courseData,
                onSave: updateCourse,
                onClose: () => setModal(null),
              })
            ),
        },
        'Editar'
      )
    ),

    e(
      'div',
      { className: 'space-y-2' },
      e(
        'button',
        {
          className:
            'w-full bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: () =>
            setModal(
              e(NewStudentModal, {
                onSave: addStudent,
                onClose: () => setModal(null),
              })
            ),
        },
        'Agregar estudiante'
      )
    ),

    e(
      'div',
      null,
      e(
        'table',
        { className: 'w-full mt-4 text-sm' },
        e(
          'thead',
          null,
          e(
            'tr',
            { className: 'border-b border-slate-300' },
            e('th', { className: 'text-left py-2' }, 'Nombre'),
            e('th', { className: 'text-left py-2' }, '%'),
            e('th', { className: 'text-left py-2' }, 'Acciones')
          )
        ),
        e(
          'tbody',
          null,
          ...estudiantesOrdenados.map((s) =>
            e(
              'tr',
              { key: s.id, className: 'border-b border-slate-200' },
              e('td', { className: 'py-2' }, s.nombre),
              e('td', { className: 'py-2' }, pct(s.stats)),
              e(
                'td',
                { className: 'py-2 space-x-2' },
                e(
                  'button',
                  {
                    className:
                      'px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700',
                    onClick: () =>
                      setModal(
                        e(AttendanceModal, {
                          student: s,
                          course: courseData,
                          onSave: updateStudent,
                          onClose: () => setModal(null),
                        })
                      ),
                  },
                  'Asistencia'
                ),
                e(
                  'button',
                  {
                    className:
                      'px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700',
                    onClick: () =>
                      setModal(
                        e(GradesModal, {
                          student: s,
                          onSave: updateStudent,
                          onClose: () => setModal(null),
                        })
                      ),
                  },
                  'Notas'
                ),
                e(
                  'button',
                  {
                    className:
                      'px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-red-700',
                    onClick: () => removeStudent(s),
                  },
                  'Eliminar'
                )
              )
            )
          )
        )
      )
    ),

    modal
  );
}

// ------- Export / Import -------
function ExportImportModal({ data, onClose }) {
  function exportarJSON() {
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asistencia_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarJSON(ev) {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed && parsed.courses) {
          saveData(parsed);
          alert('Datos importados. Recarga la página.');
        } else {
          alert('Archivo inválido.');
        }
      } catch {
        alert('Error leyendo archivo.');
      }
    };
    reader.readAsText(file);
  }

  function exportarExcel() {
    const wb = XLSX.utils.book_new();

    data.courses.forEach((course) => {
      const rows = [['Nombre', 'Presente', 'Ausente', 'Tarde', '%']];
      course.estudiantes.forEach((s) => {
        const st = safeStats(s.stats);
        rows.push([
          s.nombre,
          st.present,
          st.absent,
          st.later,
          pct(st),
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, course.nombre.substring(0, 30));
    });

    XLSX.writeFile(wb, 'asistencia.xlsx');
  }

  return e(
    Modal,
    { title: 'Exportar / Importar', onClose },
    e(
      'div',
      { className: 'space-y-4' },
      e(
        'button',
        {
          className:
            'w-full bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: exportarJSON,
        },
        'Exportar JSON'
      ),
      e(
        'button',
        {
          className:
            'w-full bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
          onClick: exportarExcel,
        },
        'Exportar Excel'
      ),
      e('div', null,
        e('label', { className: 'block text-sm text-slate-700 mb-1' }, 'Importar JSON:'),
        e('input', { type: 'file', accept: '.json', onChange: importarJSON })
      )
    )
  );
}

// ------- Main App -------
function AppShell() {
  const [data, setData] = useState(() => loadData());
  const [profile, setProfile] = useState(() => loadTeacherProfile());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modal, setModal] = useState(null);

  // Aquí validamos sesión REAL proveniente de Supabase
  const session = loadSession();

  // Si no hay sesión, dejamos que auth_supabase.js muestre su modal.
  if (!session) {
    return e(
      'div',
      { className: 'p-8 text-center text-slate-600' },
      'Cargando sesión...'
    );
  }

  function addCourse(c) {
    const newData = deepCopy(data);
    newData.courses.push(c);
    setData(newData);
    saveData(newData);
  }

  function updateCourse(updated) {
    const newData = deepCopy(data);
    const idx = newData.courses.findIndex((c) => c.id === updated.id);
    if (idx >= 0) {
      newData.courses[idx] = updated;
      setData(newData);
      saveData(newData);
    }
  }

  function removeCourse(c) {
    if (!confirm('¿Eliminar curso?')) return;
    const newData = deepCopy(data);
    newData.courses = newData.courses.filter((x) => x.id !== c.id);
    setData(newData);
    saveData(newData);
  }

  const coursesSorted = useMemo(() => {
    return [...data.courses].sort(byKeyAsc('nombre'));
  }, [data.courses]);

  return e(
    'div',
    { className: 'p-4 space-y-4' },

    e(
      'div',
      { className: 'flex justify-between items-center' },
      e('h1', { className: 'text-2xl font-bold text-slate-800' }, 'Mis cursos'),
      e(
        'button',
        {
          className:
            'px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700',
          onClick: () =>
            setModal(
              e(TeacherProfileModal, {
                profile,
                onSave: (p) => {
                  setProfile(p);
                  saveTeacherProfile(p);
                },
                onClose: () => setModal(null),
              })
            ),
        },
        profile.nombre || 'Docente'
      )
    ),

    // Botón cerrar sesión de Supabase
    e(
      'button',
      {
        className:
          'mt-2 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700',
        onClick: () => {
          if (window.supabaseAuth) {
            window.supabaseAuth.signOut();
          }
        },
      },
      'Cerrar sesión'
    ),

    e(
      'div',
      null,
      e(
        'table',
        { className: 'w-full mt-4 text-sm' },
        e(
          'thead',
          null,
          e(
            'tr',
            { className: 'border-b border-slate-300' },
            e('th', { className: 'text-left py-2' }, 'Nombre'),
            e('th', { className: 'text-left py-2' }, 'Turno'),
            e('th', { className: 'text-left py-2' }, 'Días'),
            e('th', { className: 'text-left py-2' }, 'Acciones')
          )
        ),
        e(
          'tbody',
          null,
          ...coursesSorted.map((c) =>
            e(
              'tr',
              { key: c.id, className: 'border-b border-slate-200' },
              e('td', { className: 'py-2' }, c.nombre),
              e('td', { className: 'py-2' }, c.turno),
              e(
                'td',
                { className: 'py-2' },
                (c.dias || []).map((d) => d.toUpperCase()).join(', ')
              ),
              e(
                'td',
                { className: 'py-2 space-x-2' },
                e(
                  'button',
                  {
                    className:
                      'px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700',
                    onClick: () => setSelectedCourse(c),
                  },
                  'Entrar'
                ),
                e(
                  'button',
                  {
                    className:
                      'px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700',
                    onClick: () =>
                      setModal(
                        e(EditCourseModal, {
                          course: c,
                          onSave: updateCourse,
                          onClose: () => setModal(null),
                        })
                      ),
                  },
                  'Editar'
                ),
                e(
                  'button',
                  {
                    className:
                      'px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-red-700',
                    onClick: () => removeCourse(c),
                  },
                  'Eliminar'
                )
              )
            )
          )
        )
      )
    ),

    e(
      'button',
      {
        className:
          'w-full bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700',
        onClick: () =>
          setModal(
            e(NewCourseModal, {
              onSave: addCourse,
              onClose: () => setModal(null),
            })
          ),
      },
      'Nuevo curso'
    ),

    e(
      'button',
      {
        className:
          'w-full bg-slate-600 text-white px-4 py-2 rounded shadow hover:bg-slate-700 mt-2',
        onClick: () =>
          setModal(
            e(ExportImportModal, {
              data,
              onClose: () => setModal(null),
            })
          ),
      },
      'Exportar / Importar datos'
    ),

    selectedCourse &&
      e(CourseView, {
        course: selectedCourse,
        onBack: () => setSelectedCourse(null),
        onUpdateCourse: updateCourse,
      }),

    modal
  );
}

// ===== Render =====
ReactDOM.createRoot(document.getElementById('root')).render(e(AppShell));
