/*----- Importaciones y dependencias -----*/
import { Link } from 'react-router-dom';

export const LandingScreen = () => {
    return(
        <div className='landing-page__wrapper'>
            <Link className='button link_like' to="/login">
                <p>pagina de login</p>
            </Link>
        </div>
    );
}