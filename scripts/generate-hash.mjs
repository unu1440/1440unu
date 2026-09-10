// 관리자 비밀번호의 bcrypt 해시를 생성합니다.
// 사용법: node scripts/generate-hash.mjs 원하는비밀번호
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("사용법: node scripts/generate-hash.mjs 원하는비밀번호");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\n이 값을 .env 파일의 ADMIN_PASSWORD_HASH 에 붙여넣으세요:\n");
console.log(hash);
console.log("");
