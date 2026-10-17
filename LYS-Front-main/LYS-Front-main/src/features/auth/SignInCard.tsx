import { useState, type FormEvent } from "react";
import { Icon, GoogleIcon } from "../../components/Icon";
import { AuthField } from "./AuthField";
import { useSignIn } from "./useSignIn";

type FieldName = "email" | "password";
export function SignInCard({
  onHelp,
}: {
  onHelp: (action: "register" | "recover") => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const { pending, provider, status, message, submit } = useSignIn();

  function validate(input: HTMLInputElement) {
    const error = input.validity.valueMissing
      ? input.name === "email"
        ? "Ingresa tu correo electrónico."
        : "Ingresa tu contraseña."
      : input.validity.typeMismatch
        ? "Ingresa un correo válido, por ejemplo nombre@correo.com."
        : "";
    setErrors((current) => ({ ...current, [input.name]: error }));
    return !error;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const password = form.elements.namedItem("password") as HTMLInputElement;
    const emailValid = validate(email);
    const passwordValid = validate(password);
    if (!emailValid || !passwordValid) {
      (!emailValid ? email : password).focus();
      return;
    }
    const values = new FormData(form);
    void submit({
      email: email.value.trim(),
      password: password.value,
      remember: values.get("remember") === "on",
    });
  }

  return (
    <section
      className="sign-in-card compact-auth-card login-card"
      id="iniciar-sesion"
      aria-labelledby="sign-in-title"
    >
      <header className="auth-heading">
        <h2 id="sign-in-title">
          <span className="heading-rays" aria-hidden="true" />
          Inicia sesión
          <span className="heading-rays" aria-hidden="true" />
        </h2>
        <p className="auth-description">Nos alegra verte de nuevo</p>
      </header>
      <form onSubmit={onSubmit} noValidate aria-busy={pending}>
        <div className="fields">
          <AuthField
            label="Correo electrónico"
            icon="mail"
            id="email"
            name="email"
            type="email"
            placeholder="Tu correo electrónico"
            autoComplete="email"
            required
            disabled={pending}
            error={errors.email}
            onBlur={(event) => validate(event.currentTarget)}
            onChange={(event) => {
              if (errors.email) validate(event.currentTarget);
            }}
          />
          <AuthField
            label="Contraseña"
            icon="lock"
            id="password"
            name="password"
            type="password"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            required
            disabled={pending}
            error={errors.password}
            onBlur={(event) => validate(event.currentTarget)}
            onChange={(event) => {
              if (errors.password) validate(event.currentTarget);
            }}
          />
        </div>
        <div className="form-options">
          <label className="remember-option">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              disabled={pending}
            />
            <span className="checkbox-mark" aria-hidden="true">
              <Icon name="check" />
            </span>
            <span>Recordarme</span>
          </label>
          <button
            className="text-link"
            type="button"
            onClick={() => onHelp("recover")}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <button
          className="primary-button sign-in-button"
          type="submit"
          disabled={pending}
        >
          <span>
            {pending && provider === "password"
              ? "Iniciando sesión…"
              : "Iniciar sesión"}
          </span>
          {pending && provider === "password" ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <Icon name={status === "success" ? "check" : "arrow"} />
          )}
        </button>
      </form>
      <div className="or-divider">
        <span>o continúa con</span>
      </div>
      <button
        className="google-button"
        type="button"
        disabled={pending}
        onClick={() => void submit()}
      >
        {pending && provider === "google" ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <GoogleIcon />
        )}
        <span>
          {pending && provider === "google"
            ? "Conectando con Google…"
            : "Continuar con Google"}
        </span>
      </button>
      <div className="register-divider">
        <span>¿No tienes una cuenta?</span>
        <button
          className="text-link"
          type="button"
          onClick={() => onHelp("register")}
        >
          Crear cuenta
        </button>
      </div>
      {message && (
        <p
          key={status + message}
          className={`auth-message ${status}`}
          role={status === "error" ? "alert" : "status"}
        >
          {status === "success" && <Icon name="check" />}
          <span>{message}</span>
        </p>
      )}
    </section>
  );
}
