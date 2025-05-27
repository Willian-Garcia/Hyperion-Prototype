import styled from "styled-components";

export const NavBar = styled.div`
  position: absolute;
  right: 0rem;
  display: flex;
  flex-direction: column;
  background-color: #222223;
  z-index: 1000;
  height: 92vh;
  width: 4vw;
  min-width: 40px;
  align-items: center;
  position: relative;
`;

export const Top = styled.div`
  margin-top: 0.75rem;
  gap: 0.75rem;
  display: flex;
  flex-direction: column;
`;

export const NavButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const Bottom = styled.div`
  position: absolute;
  bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const FilterPanel = styled.div`
  position: absolute;
  top: 0;
  right: 100%;
  width: 280px;
  height: 100%;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 12px 0px 0px 12px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  z-index: 1500;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  @media (max-width: 1024px) {
    width: 320px;
  }

  @media (max-width: 768px) {
    width: 80vw;
    border-radius: 0px;
    right: 0;
  }

  @media (max-width: 480px) {
    width: 100vw;
    height: 100vh;
    padding-top: 2rem;
    border-radius: 0px;
    right: 0;
  }
`;

export const ScrollContainer = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
  padding-bottom: 1rem;
  padding-right: 1rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c0c0c0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

export const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  position: absolute;
  top: 1rem;
  left: 1rem;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const SearchIcon = styled.img`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
`;

export const InputCustom = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #d9d9d9;
`;

export const InputCustom2 = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #d9d9d9;
  padding-left: 12px;
`;

export const InputUser = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #d9d9d9;
  padding-left: 12px;
  padding-right: 40px;
`;

export const InputWithIcon = styled(InputCustom)`
  padding-left: 40px;
`;

export const ButtonCustom = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #fe5000;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;

  &:hover {
    background-color: #e24600;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ButtonCustom2 = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #fe5000;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;

  &:hover {
    background-color: #e24600;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const SelectCustom = styled.select`
  width: 100%;
  padding: 8px 16px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #d9d9d9;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='2' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  cursor: pointer;
`;

export const OptionDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

export const Options = styled.label`
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
`;

export const EyeButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  img {
    width: 20px;
    height: 20px;
  }
`;