import { ErrorDisplay } from './components/error';

export default function NotFoundComponent() {
    return (
        <ErrorDisplay
            error={new Error('Not Found')}
            errorCode={404}
            title="Not Found"
            message="The page you are looking for does not exist."
            showHomeButton={true}
            showDetails={true}
        />
    );
}
