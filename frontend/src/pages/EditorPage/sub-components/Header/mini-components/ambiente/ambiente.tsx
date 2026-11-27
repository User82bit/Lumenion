import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

export default function AmbienteItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button><FaIcons.FaMountain size={24}/><h5>Configurar ambiente</h5></button>
                </>
            }
        />
    );
}
