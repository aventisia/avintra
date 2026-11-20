type PwdRule = { label: string; test: (pwd: string) => boolean };

/** The backend password policy (`pwdRegex` plus the 16-character cap), one rule per line. */
const PWD_RULES: PwdRule[] = [
  { label: "8 to 16 characters", test: (pwd) => pwd.length >= 8 && pwd.length <= 16 },
  { label: "Upper and lowercase", test: (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) },
  { label: "A number", test: (pwd) => /[0-9]/.test(pwd) },
  { label: "A symbol: # ? ! @ $ % ^ & * -", test: (pwd) => /[#?!@$%^&*-]/.test(pwd) },
];

export { PWD_RULES, type PwdRule };
