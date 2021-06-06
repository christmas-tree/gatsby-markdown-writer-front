import styled from 'styled-components';

const StyledDiv = styled.div`
  height: 300px;
  display: flex;
  justify-content: center;
  flex-direction: column;
`

const PageNotFound = () => (
    <StyledDiv>
        <h1>404</h1>
        <h5>
            There's just nothing here pal.
        </h5>
    </StyledDiv>
)

export default PageNotFound;