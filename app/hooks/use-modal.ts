import {
    ModalName,
    useActiveIds,
    useAddModal,
    useModals,
    useRemoveModal,
    useSetActiveId,
} from '@/service/stores/modal.store';

export const useModal = (name: ModalName) => {
    const addModal = useAddModal();
    const removeModal = useRemoveModal();
    const modals = useModals();
    const setActiveId = useSetActiveId();
    const activeIds = useActiveIds();

    return {
        isOpen: !!modals[name],
        data: activeIds[name],
        open: (data?: string) => {
            if (data) setActiveId(name, data);
            addModal(name);
        },
        close: () => {
            removeModal(name);
        },
    };
};
