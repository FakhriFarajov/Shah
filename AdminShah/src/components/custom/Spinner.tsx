import { RotatingLines } from 'react-loader-spinner'

export default function Spinner() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
            />
            <span style={{ marginTop: 16, fontSize: 18, color: '#555', fontWeight: 500 }}>Loading...</span>
        </div>
    )
}