const users = [
  { id: 1, email: "rladlsdud789@naver.com", password: "gkgk800301!" },
];

export async function findUserByEmail(email: string) {
  return users.find((user) => user.email === email);
}
