export function saveUserToken(userToken) {
  localStorage.setItem("TOKEN", userToken);
}
export function getUserToken() {
  return localStorage.getItem("TOKEN");
}
export function clearUserToken() {
  return localStorage.removeItem("TOKEN");
}

export function saveUserisTeller(isTeller) {
  localStorage.setItem("isTeller", String(isTeller));
}
export function getUserisTeller() {
  const isTellerString = localStorage.getItem("isTeller");
  return isTellerString ? JSON.parse(isTellerString) : false;
}
export function clearUserisTeller() {
  return localStorage.removeItem("isTeller");
}
