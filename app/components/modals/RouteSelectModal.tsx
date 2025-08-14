import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useModal } from '@/hooks/use-modal';

export const RouteSelectModal = () => {
    const { isOpen, close } = useModal('RouteSelector');

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Route Selector</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">Route Selector</div>
            </DialogContent>
        </Dialog>
    );
};
