export default ({ children }) => {
  return (
    <div
      style={{
        scrollSnapType: "y mandatory",
        overflowY: "scroll",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
};
