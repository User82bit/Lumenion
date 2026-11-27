import ItensLayoutBase from "../components/layout-itens-base/itens-layout";
import * as FaIcons from 'react-icons/fa'

export default function OutButton() {

    const handleOpenProject = () => {
        const nextUrl = `/home`;
        window.history.pushState({}, '', nextUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <ItensLayoutBase
        isVisible = {true}
        content = {
            <>
                <button onClick={ handleOpenProject }>
                    <FaIcons.FaFolderOpen size={24}/>
                    <h5> Sair e Salvar </h5>
                </button>
                <button>
                    <FaIcons.FaSave size={24}/>
                    <h5>Salvar</h5>
                </button>
            </>}
        />
    )
}
