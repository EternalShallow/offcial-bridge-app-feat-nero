import { useEffect, useMemo, useState } from 'react';

import { useTheme } from 'next-themes';
import Image from 'next/image';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Moon, Sun } from 'lucide-react';

import { OBLogo, OBLogoDark, OBLogoSmall, OBLogoSmallDark } from '@/components/icons';
import { useIsOBridge } from '@/hooks/apps/use-is-obridge';
import { useNavIcon } from '@/hooks/use-theme';

export function Header() {
    const isOBridge = useIsOBridge();
    const navIcon = useNavIcon();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const Logo = useMemo(() => (theme === 'dark' ? OBLogo : OBLogoDark), [theme]);
    const SmallLogo = useMemo(() => (theme === 'dark' ? OBLogoSmall : OBLogoSmallDark), [theme]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <nav className="flex justify-between items-center p-3 md:p-6 fixed top-0 left-0 w-screen z-10">
            <div>
                {isOBridge ? (
                    <div className="flex gap-2 items-center">
                        <Logo className="hidden md:inline-flex h-9 w-auto transform-gpu overflow-visible -ml-1" />
                        <SmallLogo className="md:hidden h-9 w-auto -ml-0.5" />
                    </div>
                ) : (
                    <Image
                        src={navIcon}
                        width={0}
                        height={0}
                        sizes="100vw"
                        alt={'logo'}
                        className="inline-flex w-auto max-w-40 h-8"
                    />
                )}
            </div>

            <div className="flex gap-2">
                <ConnectButton
                    chainStatus="icon"
                    label="Connect"
                    showBalance={{ smallScreen: false, largeScreen: false }}
                    accountStatus={{
                        smallScreen: 'avatar',
                        largeScreen: 'avatar',
                    }}
                />
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun /> : <Moon />}
                </button>
                {/* <HeaderLinks /> */}
            </div>
        </nav>
    );
}
