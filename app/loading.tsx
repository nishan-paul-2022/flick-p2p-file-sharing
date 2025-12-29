export default function Loading() {
    return (
        <div className="min-h-screen gradient-secondary flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading Flick...</p>
            </div>
        </div>
    );
}
