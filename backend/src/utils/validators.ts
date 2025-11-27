export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string) {
  return typeof password === "string" && password.length >= 6;
}

export function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function isValidUPI(upiId: string) {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(String(upiId).trim());
}

export function normalizeUPI(upiId: string) {
  return String(upiId).trim();
}

export function isValidAirportCode(code: string) {
  return /^[A-Z]{3}$/.test(String(code).toUpperCase());
}

export function isValidISODate(date: string) {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export function luhnCheck(num: string) {
  const n = String(num).replace(/\s+/g, "");
  if (!/^[0-9]{12,19}$/.test(n)) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = Number(n[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function getCardBrand(num: string) {
  const n = String(num).replace(/\s+/g, "");
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(n)) return "VISA";
  if (/^(5[1-5][0-9]{14}|2(2[2-9][0-9]{12}|[3-6][0-9]{13}|7[01][0-9]{12}|720[0-9]{12}))$/.test(n)) return "MASTERCARD";
  if (/^3[47][0-9]{13}$/.test(n)) return "AMEX";
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(n)) return "DISCOVER";
  return "UNKNOWN";
}
