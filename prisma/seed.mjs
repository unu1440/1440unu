// 초기 샘플 글을 넣어주는 시드 스크립트
// 실행: node prisma/seed.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.post.count();
  if (count > 0) {
    console.log("이미 글이 있어서 시드를 건너뜁니다.");
    return;
  }

  await prisma.post.create({
    data: {
      slug: "first-page",
      title: "1440분 중 이 한 페이지",
      excerpt: "왜 굳이 하루를 분 단위로 세면서 블로그를 시작했는지에 대한 첫 기록.",
      content:
        "<p>하루는 1440분이다. 24시간, 86400초. 어쩐지 이 숫자를 알고 나서부터 시간이 다르게 보이기 시작했다.</p><p>이 사이트의 이름을 <strong>1440unu</strong>로 지은 건 그래서다. 1440은 하루의 분, unu는 에스페란토로 '하나'라는 뜻이다.</p>",
      published: true,
    },
  });

  console.log("샘플 글 하나를 넣었습니다.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
