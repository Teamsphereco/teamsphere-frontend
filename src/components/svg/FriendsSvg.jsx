const FriendsSvg = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M8 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M16 13c2.67 0 5 1.33 5 3v1H11v-1c0-1.67 2.33-3 5-3Z" />
    <path d="M8 15c3.33 0 6 1.67 6 4v1H2v-1c0-2.33 2.67-4 6-4Z" />
  </svg>
);

export default FriendsSvg;
