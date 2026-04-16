/**
 * CONSENT.JS - Sistema Global de Consentimiento
 * Cumple con: RGPD (Europa) + LFPDPPP (México) + Normativas LATAM
 * Versión: 2.0 - Multi-región
 */

(function() {
  'use strict';
  
  const COOKIE_NAME = 'conteniza_consent';
  const COOKIE_EXPIRY = 365; // días
  
  // Estado del consentimiento
  let userRegion = 'OTHER';
  
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  async function init() {
    console.log('🌍 Sistema de consentimiento global iniciado');
    
    // Detectar región del usuario
    userRegion = await detectRegion();
    console.log('📍 Región detectada:', userRegion);
    
    // Inyectar UI de consentimientos en formulario
    injectConsentUI();
    interceptAuthForm();
    interceptToggleAuthMode();
  }
  
  // ========================================
  // DETECCIÓN DE REGIÓN
  // ========================================
  
  async function detectRegion() {
    try {
      const response = await fetch('https://ipapi.co/json/', { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Error en detección de región');
      
      const data = await response.json();
      const country = data.country_code;
      
      const euCountries = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
      ];
      
      const latamCountries = [
        'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV',
        'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'UY', 'VE'
      ];
      
      if (euCountries.includes(country)) return 'EU';
      if (country === 'MX') return 'MX';
      if (latamCountries.includes(country)) return 'LATAM';
      
      return 'OTHER';
      
    } catch (error) {
      console.warn('⚠️ Error detectando región, usando modo global:', error);
      return 'EU'; // Por defecto el más estricto (RGPD)
    }
  }
  
  // ========================================
  // INYECTAR UI DE CONSENTIMIENTOS
  // ========================================
  
function injectConsentUI() {
  const authForm = document.getElementById('authForm');
  if (!authForm) {
    console.warn('⚠️ Formulario authForm no encontrado');
    return;
  }
  
  // Verificar si ya existe (evitar duplicados)
  if (document.getElementById('consentSection')) {
    return;
  }
    
    // Textos adaptados según región
    const regionTexts = {
      'EU': {
        mandatory: 'RGPD - Unión Europea',
        authority: 'Autoridad Europea de Protección de Datos',
        rights: 'Acceso, Rectificación, Supresión, Portabilidad, Limitación, Oposición'
      },
      'MX': {
        mandatory: 'LFPDPPP - México',
        authority: 'INAI (Instituto Nacional de Transparencia)',
        rights: 'Derechos ARCO: Acceso, Rectificación, Cancelación, Oposición'
      },
      'LATAM': {
        mandatory: 'Normativa Local',
        authority: 'Autoridad de Protección de Datos de tu país',
        rights: 'Acceso, Rectificación, Cancelación, Oposición'
      },
      'OTHER': {
        mandatory: 'Normativa Internacional',
        authority: 'Autoridades competentes',
        rights: 'Acceso, Rectificación, Supresión de datos'
      }
    };
    
    const texts = regionTexts[userRegion] || regionTexts['OTHER'];
    
    // Crear sección de consentimientos
const consentHTML = `
      <div id="consentSection" style="display: block; margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px; border: 2px solid #E9D8FD; box-shadow: 0 2px 8px rgba(139, 95, 191, 0.1);">
        
        <!-- Info de región detectada -->
        <div style="padding: 10px; background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 8px; margin-bottom: 16px; text-align: center;">
          <p style="font-size: 12px; color: #1e40af; margin: 0; font-weight: 600;">
            🌍 Región: ${userRegion === 'EU' ? '🇪🇺 Europa' : userRegion === 'MX' ? '🇲🇽 México' : userRegion === 'LATAM' ? '🌎 LATAM' : '🌐 Internacional'} | 
            Cumplimos con: ${texts.mandatory}
          </p>
        </div>
        
        <!-- Consentimiento OBLIGATORIO -->
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display: flex; align-items: start; gap: 10px; cursor: pointer;" id="privacyLabel">
            <input type="checkbox" id="privacyConsent" 
                   style="margin-top: 4px; min-width: 18px; height: 18px; cursor: pointer; accent-color: #8B5FBF;">
            <span style="font-size: 14px; color: #2D3748; line-height: 1.5;">
              <strong style="color: #8B5FBF;">* Obligatorio:</strong> 
              He leído y acepto la 
              <a href="privacy.html" target="_blank" 
                 style="color: #8B5FBF; text-decoration: underline; font-weight: 600;">
                Política de Privacidad
              </a>
              y los 
              <a href="terms.html" target="_blank" 
                 style="color: #8B5FBF; text-decoration: underline; font-weight: 600;">
                Términos y Condiciones
              </a>.
            </span>
          </label>
        </div>
        
        <!-- Consentimiento OPCIONAL (marketing) -->
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display: flex; align-items: start; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="marketingConsent" 
                   style="margin-top: 4px; min-width: 18px; height: 18px; cursor: pointer; accent-color: #2CD4A4;">
            <span style="font-size: 14px; color: #718096; line-height: 1.5;">
              <em>Opcional:</em> Deseo recibir tips de contenido, novedades y ofertas por email.
            </span>
          </label>
        </div>
        
        <!-- Info de derechos adaptada por región -->
        <div style="padding: 14px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; border-left: 4px solid #6ECBF5;">
          <p style="font-size: 12px; color: #1e40af; margin: 0; line-height: 1.6;">
            ℹ️ <strong>Tus derechos:</strong> ${texts.rights}<br>
            <strong>Autoridad:</strong> ${texts.authority}<br>
            <strong>Contacto:</strong> hola@conteniza.com
          </p>
        </div>
      </div>
    `;
    if (authForm) {
  authForm.insertAdjacentHTML('beforeend', consentHTML);
}
console.log('✅ UI de consentimientos inyectada para región:', userRegion);
}
  // ========================================
  // INTERCEPTAR toggleAuthMode
  // ========================================
  
function interceptToggleAuthMode() {
    const originalToggleAuthMode = window.toggleAuthMode;
    
    if (!originalToggleAuthMode) {
      console.warn('⚠️ toggleAuthMode no encontrada');
      return;
    }
    
    window.toggleAuthMode = function() {
      originalToggleAuthMode();
      
      // Esperar a que el DOM se actualice
      setTimeout(() => {
        const consentSection = document.getElementById('consentSection');
        const authTitle = document.getElementById('authTitle');
        
        if (consentSection && authTitle) {
          const isRegisterMode = authTitle.textContent.includes('Crear Cuenta');
          consentSection.style.display = isRegisterMode ? 'block' : 'none';
        }
      }, 100);
    };
    
    console.log('✅ toggleAuthMode interceptada');
  }
  
// ========================================
  // INTERCEPTAR handleAuth
  // ========================================
  
  function interceptAuthForm() {
    const authForm = document.getElementById('authForm');
    if (!authForm) return;
    
    const originalSubmit = window.handleAuth;
    
    if (!originalSubmit) {
      console.warn('⚠️ handleAuth no encontrada');
      return;
    }
    
    window.handleAuth = async function(event) {
      event.preventDefault();
      
      const authTitle = document.getElementById('authTitle');
      const isRegisterMode = authTitle && authTitle.textContent.includes('Crear Cuenta');
      
      // VALIDAR CONSENTIMIENTO OBLIGATORIO en registro
      if (isRegisterMode) {
        const privacyConsent = document.getElementById('privacyConsent');
        
        if (!privacyConsent || !privacyConsent.checked) {
          // Mensaje adaptado según región
          const errorMessages = {
            'EU': '⚠️ Debes aceptar la Política de Privacidad (RGPD) para continuar',
            'MX': '⚠️ Debes aceptar el Aviso de Privacidad (LFPDPPP) para continuar',
            'LATAM': '⚠️ Debes aceptar la Política de Privacidad para continuar',
            'OTHER': '⚠️ Debes aceptar la Política de Privacidad para continuar'
          };
          
          const errorMsg = errorMessages[userRegion] || errorMessages['OTHER'];
          
          if (window.showNotification) {
            window.showNotification(errorMsg, 'error');
          } else {
            alert(errorMsg);
          }
          
          // Efecto visual de error
          const label = document.getElementById('privacyLabel');
          if (label) {
            label.style.animation = 'shake 0.5s';
            label.style.border = '2px solid #FF6B6B';
            label.style.borderRadius = '8px';
            label.style.padding = '8px';
            
            setTimeout(() => {
              label.style.animation = '';
              label.style.border = 'none';
              label.style.padding = '0';
            }, 1000);
          }
          
          return; // DETENER
        }
      }
      
      // Interceptar fetch para agregar consentimientos
      interceptFetch(isRegisterMode);
      
      // Llamar a la función original
      await originalSubmit(event);
    };
    
    console.log('✅ handleAuth interceptada');
  }
  
  // ========================================
  // INTERCEPTAR FETCH
  // ========================================
  
  function interceptFetch(isRegisterMode) {
    if (!isRegisterMode) return;
    
    const originalFetch = window.fetch;
    let fetchIntercepted = false;
    
    window.fetch = function(...args) {
      if (fetchIntercepted) {
        return originalFetch.apply(this, args);
      }
      
      const [url, options] = args;
      
      // Solo interceptar llamadas a /auth/register
      if (url && url.includes('/auth/register')) {
        fetchIntercepted = true;
        
        try {
          const body = JSON.parse(options.body);
          
          // Agregar consentimientos + región
          body.privacy_consent = true;
          body.marketing_consent = document.getElementById('marketingConsent')?.checked || false;
          body.consent_date = new Date().toISOString();
          body.user_region = userRegion;
          body.applicable_law = userRegion === 'EU' ? 'RGPD' : 
                                userRegion === 'MX' ? 'LFPDPPP' : 
                                'LOCAL';
          
          options.body = JSON.stringify(body);
          
          console.log('✅ Consentimientos agregados:', {
            privacy: body.privacy_consent,
            marketing: body.marketing_consent,
            region: body.user_region,
            law: body.applicable_law
          });
        } catch (e) {
          console.error('❌ Error modificando payload:', e);
        }
        
        // Restaurar fetch original
        setTimeout(() => {
          window.fetch = originalFetch;
          fetchIntercepted = false;
        }, 100);
      }
      
      return originalFetch.apply(this, args);
    };
  }
  
})();