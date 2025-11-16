// auth_supabase.js
// Archivo listo para usar con Supabase. NO hace falta modificar nada.
// Debe cargarse en index.html antes de app (1).js.

const SESSION_KEY = 'session_user_v1';

// === TUS DATOS DE SUPABASE (YA INSERTADOS) ===
const SUPABASE_URL = "https://arwzwdyaukilbsxvsfsl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd3p3ZHlhdWtpbGJzeHZzZnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMzAwNjMsImV4cCI6MjA3ODkwNjA2M30.0s2D5YBdBqQnTsITB8T797iAmAZrEZrNRrttYmz9c_k";

// Cargar SDK de Supabase dinámicamente
(async function initSupabaseAuth(){
  let createClient;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    createClient = mod.createClient;
  } catch(e){
    console.error('No se pudo cargar Supabase SDK:', e);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Guarda sesión como la app original espera
  function saveSessionForApp(user){
    if(!user) { localStorage.removeItem(SESSION_KEY); return; }

    const sess = {
      uid: user.id || null,
      usuario: user.email || '',
      displayName: (user.user_metadata && user.user_metadata.full_name) || ''
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
  }

  function clearSessionForApp(){
    localStorage.removeItem(SESSION_KEY);
  }

  // Eventos de Supabase Auth
  supabase.auth.onAuthStateChange((event, session) => {
    if(event === 'SIGNED_IN' && session?.user){
      saveSessionForApp(session.user);
      if(window.__onSupabaseLogin) try { window.__onSupabaseLogin(session.user); } catch(_) {}
    }
    if(event === 'SIGNED_OUT'){
      clearSessionForApp();
      if(window.__onSupabaseLogout) try { window.__onSupabaseLogout(); } catch(_) {}
    }
  });

  // API pública (útil si querés llamarla desde consola o desde otros scripts)
  window.supabaseAuth = {
    signUp: async (email,password,fullName) => {
      const { data, error } = await supabase.auth.signUp(
        { email, password, options:{ data:{ full_name: fullName }} }
      );
      if(error) throw error;
      if(data?.user) saveSessionForApp(data.user);
      return data;
    },
    signIn: async (email,password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if(error) throw error;
      if(data?.user) saveSessionForApp(data.user);
      return data;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if(error) throw error;
      clearSessionForApp();
    },
    getUser: async () => {
      const { data:{user}, error } = await supabase.auth.getUser();
      if(error) throw error;
      return user;
    }
  };

  // ==== UI (modal de login simple) ====

  function makeModal(){
    if(document.getElementById('supabase-auth-modal')) return;

    const div = document.createElement('div');
    div.id = 'supabase-auth-modal';
    div.style = `
      position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
      background:rgba(0,0,0,0.35); z-index:99999;
    `;

    div.innerHTML = `
      <div style="width:380px; max-width:92%; background:white; border-radius:12px;
                  padding:18px; box-shadow:0 10px 30px rgba(0,0,0,0.2); font-family:system-ui;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <strong style="font-size:18px;color:#1f3a5f">Iniciar sesión / Registrarse</strong>
          <button id="sb-close" style="background:none;border:0;font-size:18px;cursor:pointer;color:#888">✕</button>
        </div>

        <input id="sb-name" placeholder="Nombre completo (para registro)" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-bottom:8px" />

        <input id="sb-email" placeholder="Correo" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-bottom:8px" />

        <input id="sb-pass" placeholder="Contraseña" type="password" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-bottom:10px" />

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <button id="sb-login" style="background:#2f6fa6;color:white;border:0;padding:8px 12px;border-radius:8px;cursor:pointer">Ingresar</button>
          <button id="sb-register" style="background:#6c467e;color:white;border:0;padding:8px 12px;border-radius:8px;cursor:pointer">Crear cuenta</button>
        </div>

        <a id="sb-forgot" style="font-size:13px;color:#2f6fa6;cursor:pointer">Olvidé mi contraseña</a>

        <div id="sb-msg" style="margin-top:10px;color:#b91c1c;font-size:13px;min-height:20px"></div>
      </div>
    `;

    document.body.appendChild(div);

    const email = div.querySelector("#sb-email");
    const pass = div.querySelector("#sb-pass");
    const name = div.querySelector("#sb-name");
    const loginBtn = div.querySelector("#sb-login");
    const regBtn = div.querySelector("#sb-register");
    const closeBtn = div.querySelector("#sb-close");
    const forgotBtn = div.querySelector("#sb-forgot");
    const msg = div.querySelector("#sb-msg");

    closeBtn.onclick = ()=> div.style.display = "none";

    forgotBtn.onclick = async ()=>{
      if(!email.value){ msg.textContent = "Ingresá tu correo."; return; }
      msg.textContent = "Enviando correo...";
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.value);
        if(error) msg.textContent = error.message;
        else msg.textContent = "Correo enviado. Revisá tu bandeja!";
      } catch(e){ msg.textContent = e.message; }
    };

    loginBtn.onclick = async ()=>{
      msg.textContent = "Ingresando...";
      try {
        await window.supabaseAuth.signIn(email.value, pass.value);
        msg.textContent = "Listo!";
        setTimeout(()=> div.style.display = "none", 600);
      } catch(e){ msg.textContent = e.message; }
    };

    regBtn.onclick = async ()=>{
      msg.textContent = "Creando cuenta...";
      try {
        await window.supabaseAuth.signUp(email.value, pass.value, name.value);
        msg.textContent = "Cuenta creada.";
        setTimeout(()=> div.style.display = "none", 700);
      } catch(e){ msg.textContent = e.message; }
    };

    return div;
  }

  window.openSupabaseAuthModal = function(){
    const m = makeModal();
    m.style.display = 'flex';
  };

  // Si no hay sesión, abrir modal automáticamente
  (function autoShow(){
    const local = localStorage.getItem(SESSION_KEY);
    if(!local){
      setTimeout(()=> window.openSupabaseAuthModal(), 800);
    }
  })();

})();
