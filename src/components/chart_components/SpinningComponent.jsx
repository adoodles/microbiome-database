import { TailSpin } from "react-loader-spinner";

function SpinningComponent({message}){
    return(
      <div>
        <TailSpin
          visible={true}
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass=""
        />
        {message}
      </div>
    )
}

export default SpinningComponent