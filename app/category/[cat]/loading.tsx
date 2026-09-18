// 카테고리 페이지 로딩 중 보여줄 스켈레톤 UI
export default function CategoryLoading() {
  return (
    <>
      <span className="back-link" style={{ opacity: 0.4 }}>
        ← Tree로 돌아가기
      </span>
      <div
        className="category-title"
        style={{ opacity: 0.25, background: "var(--panel)", borderRadius: 8, width: "40%", height: 32 }}
      />
      <ul className="post-list">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <div
              className="post-entry"
              style={{ opacity: 0.5, animation: "skeletonPulse 1.1s ease-in-out infinite" }}
            >
              <div style={{ width: 90, height: 10, background: "var(--panel-2)", borderRadius: 4, marginBottom: 10 }} />
              <div style={{ width: "70%", height: 16, background: "var(--panel-2)", borderRadius: 4, marginBottom: 8 }} />
              <div style={{ width: "90%", height: 12, background: "var(--panel-2)", borderRadius: 4 }} />
            </div>
          </li>
        ))}
      </ul>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}