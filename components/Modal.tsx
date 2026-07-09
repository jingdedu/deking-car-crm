export default function Modal({ title, children, onClose }: any) {
  return <div className="modalBackdrop"><div className="modal"><div className="modalHead"><h2>{title}</h2><button className="btn secondary" onClick={onClose}>닫기</button></div>{children}</div></div>;
}
