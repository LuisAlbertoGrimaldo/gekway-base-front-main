import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noWhitespaceNoSymbolsNoNumValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';

  // 1. Validar que no sea solo espacios
  const isWhitespace = value.trim().length === 0;
  if (isWhitespace) {
    return { whitespace: true };
  }

  // 2. Validar que solo contenga letras y espacios (sin números ni símbolos)
  const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
  const isValid = regex.test(value);
  if (!isValid) {
    return { invalidChars: true };
  }

  return null;
}
