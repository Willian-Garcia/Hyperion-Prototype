import styled from "styled-components";
import { hyperionLogo } from "../../assets";

const Header = styled.header`
  height: 8vh;
  background-color: #121212;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 2rem;
`;

export default function Home() {
  return (
    <Header>
      <img src={hyperionLogo} alt="HyperionLogo" />
    </Header>
  );
}
