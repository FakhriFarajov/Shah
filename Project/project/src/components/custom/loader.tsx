import { RotatingLines } from 'react-loader-spinner'

export default function Spinner() {
    return (
        <RotatingLines
            visible={true}
            height="96"
            width="96"
            color="grey"
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
            wrapperStyle={{}}
            wrapperClass=""
        />)

}