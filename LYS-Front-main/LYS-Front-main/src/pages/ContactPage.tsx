import { useState } from 'react';
import { Icon } from '../components/Icon';
import { ContactIcon } from '../components/ContactIcon';
import { business } from '../features/information/business';
import { InformationNavigation } from '../features/information/InformationShared';
import '../styles/contact-reference.css';

export function ContactPage({ onAction }: { onAction: (action: string) => void }) {
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState('');
  const phone = 'tel:+51' + business.phone.replace(/\D/g, '');
  return <>
    <main id="contenido" className="information-page contact-page contact-reference">
      <div className="contact-scene" aria-hidden="true"/>
      <header className="contact-heading">
        <h1>Hablemos</h1>
        <p>¿Tienes una consulta, sugerencia o quieres hacer una reserva?<br/> Escríbenos y te responderemos lo antes posible.</p>
      </header>
      <div className="contact-layout">
        <section className="contact-reference-card contact-message" aria-labelledby="contact-message-title">
          <p className="contact-eyebrow">Formulario de contacto</p>
          <h2 id="contact-message-title">Envíanos un <em>mensaje</em></h2>
          <form onChange={() => setReady(false)} onSubmit={event => {
            event.preventDefault(); const data = new FormData(event.currentTarget);
            setDraft(`${data.get('subject')}\n\n${message}\n\n${data.get('name')}\nTeléfono: ${data.get('phone')}\nCorreo: ${data.get('email')}`); setReady(true);
          }}>
            <div className="contact-fields">
              <label><span className="contact-field-title">Nombre completo <b>*</b></span><Icon name="user"/><input name="name" autoComplete="name" required minLength={3} maxLength={100} placeholder="Tu nombre completo"/></label>
              <label><span className="contact-field-title">Correo electrónico <b>*</b></span><Icon name="mail"/><input name="email" type="email" autoComplete="email" required maxLength={120} placeholder="tu@email.com"/></label>
              <label><span className="contact-field-title">Teléfono</span><Icon name="phone"/><input name="phone" type="tel" autoComplete="tel" pattern="[+0-9 ()-]{7,20}" maxLength={20} placeholder="Tu número de teléfono"/></label>
              <label><span className="contact-field-title">Asunto <b>*</b></span><Icon name="receipt"/><select name="subject" required defaultValue=""><option value="" disabled>Selecciona un asunto</option>{['Consulta sobre un pedido', 'Eventos y reservas', 'Sugerencia', 'Otro'].map(subject => <option key={subject}>{subject}</option>)}</select></label>
            </div>
            <label className="contact-message-field"><span className="contact-field-title">Mensaje <b>*</b></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M21 11a9 9 0 0 1-12 9l-6 2 2-6A9 9 0 1 1 21 11Z"/><path d="M8 11h1m2 0h1m2 0h1"/></svg><textarea required minLength={10} maxLength={500} rows={5} value={message} onChange={event => setMessage(event.target.value)} placeholder="Cuéntanos en qué podemos ayudarte..."/><span className="contact-message-counter">{message.length}/500</span></label>
            <div className="contact-form-footer"><button type="submit" className="contact-send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="m2 10 20-8-8 20-4-8-8-4Zm8 4L22 2"/></svg>Enviar mensaje <Icon name="arrow"/></button>
            <p className="contact-privacy"><Icon name="lock"/>Usaremos tus datos para responder. Confirma el envío en correo o WhatsApp.</p></div>
            {ready && <div className="info-prepared" role="status"><strong>Tu mensaje está listo para enviar.</strong><p>Elige una opción y confirma el envío en tu aplicación.</p><a className="info-button" href={`mailto:${business.email}?subject=${encodeURIComponent('Consulta Leñas y Sabores')}&body=${encodeURIComponent(draft)}`}>Abrir correo <Icon name="mail"/></a><a className="info-button" href={`${business.whatsapp}?text=${encodeURIComponent(draft)}`} target="_blank" rel="noopener noreferrer">Abrir WhatsApp <ContactIcon name="whatsapp"/></a><button type="button" className="contact-edit" onClick={() => setReady(false)}>Editar mensaje</button></div>}
          </form>
        </section>
        <aside className="contact-reference-card contact-channels" aria-labelledby="contact-channels-title">
          <h2 id="contact-channels-title" className="contact-eyebrow">También puedes<br/>contactarnos por</h2>
          <div className="contact-channel-list">
            <a className="contact-channel" href={business.whatsapp} target="_blank" rel="noopener noreferrer"><span className="contact-red-icon contact-whatsapp"><ContactIcon name="whatsapp"/></span><div><h3>WhatsApp</h3><p>Escríbenos directamente</p></div><Icon name="chevron"/></a>
            <a className="contact-channel" href={phone} aria-label={`Llamar al teléfono ${business.phone}`}><span className="contact-red-icon"><ContactIcon name="phone"/></span><div><h3>Teléfono</h3><p>+51 {business.phone}</p></div><Icon name="chevron"/></a>
            <a className="contact-channel" href={`mailto:${business.email}`}><span className="contact-red-icon"><ContactIcon name="mail"/></span><div><h3>Correo electrónico</h3><p>{business.email}</p></div><Icon name="chevron"/></a>
            <button className="contact-channel" type="button" onClick={() => onAction('Instagram')}><span className="contact-red-icon contact-instagram"><ContactIcon name="instagram"/></span><div><h3>Instagram</h3><p>Síguenos en redes</p></div><Icon name="chevron"/></button>
            <div className="contact-channel contact-hours"><span className="contact-red-icon"><ContactIcon name="clock"/></span><div><h3>Horario de atención</h3><p>Todos los días<br/>{business.hours}</p></div></div>
          </div>
        </aside>
      </div>
    </main>
    <InformationNavigation active="Contacto" onAction={onAction}/>
  </>;
}
