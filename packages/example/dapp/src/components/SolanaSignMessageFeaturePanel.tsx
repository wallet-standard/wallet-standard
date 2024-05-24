import { Pencil1Icon } from '@radix-ui/react-icons';
import { Blockquote, Box, Button, Code, DataList, Dialog, Flex, TextField } from '@radix-ui/themes';
import { getBase64Decoder } from '@solana/web3.js-experimental';
import type { ReactWalletAccount } from '@wallet-standard/react';
import { useSignMessage } from '@wallet-standard/react';
import type { SyntheticEvent } from 'react';
import React, { useRef, useState } from 'react';
import { ErrorDialog } from '../components/ErrorDialog';
import { FeaturePanel } from '../components/FeaturePanel';

type Props = Readonly<{
    account: ReactWalletAccount;
}>;

export function SolanaSignMessageFeaturePanel({ account }: Props) {
    const { current: NO_ERROR } = useRef(Symbol());
    const [isSigningMessage, setIsSigningMessage] = useState(false);
    const [error, seterror] = useState<typeof NO_ERROR | unknown>(NO_ERROR);
    const [lastSignature, setLastSignature] = useState<Uint8Array | undefined>();
    const [text, setText] = useState<string>();
    const signMessage = useSignMessage(account);
    return (
        <FeaturePanel label="Sign Message (Solana)">
            <Flex gap="2" direction={{ initial: 'column', sm: 'row' }} style={{ width: '100%' }}>
                <Box flexGrow="1">
                    <TextField.Root
                        placeholder="Write a message to sign"
                        onChange={(e: SyntheticEvent<HTMLInputElement>) => setText(e.currentTarget.value)}
                        value={text}
                    >
                        <TextField.Slot>
                            <Pencil1Icon />
                        </TextField.Slot>
                    </TextField.Root>
                </Box>
                <Dialog.Root
                    open={!!lastSignature}
                    onOpenChange={(open) => {
                        if (!open) {
                            setLastSignature(undefined);
                        }
                    }}
                >
                    <Dialog.Trigger>
                        <Button
                            color={error ? undefined : 'red'}
                            disabled={!text}
                            loading={isSigningMessage}
                            onClick={async (e) => {
                                e.stopPropagation();
                                seterror(NO_ERROR);
                                setIsSigningMessage(true);
                                try {
                                    const { signature } = await signMessage(new TextEncoder().encode(text));
                                    setLastSignature(signature);
                                } catch (e) {
                                    setLastSignature(undefined);
                                    seterror(e);
                                } finally {
                                    setIsSigningMessage(false);
                                }
                            }}
                        >
                            Sign Message
                        </Button>
                    </Dialog.Trigger>
                    {lastSignature ? (
                        <Dialog.Content
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <Dialog.Title>You Signed a Message!</Dialog.Title>
                            <Dialog.Description size="2">
                                <DataList.Root orientation={{ initial: 'vertical', sm: 'horizontal' }}>
                                    <DataList.Item>
                                        <DataList.Label minWidth="88px">Message</DataList.Label>
                                        <DataList.Value>
                                            <Blockquote>{text}</Blockquote>
                                        </DataList.Value>
                                    </DataList.Item>
                                    <DataList.Item>
                                        <DataList.Label minWidth="88px">Signature</DataList.Label>
                                        <DataList.Value>
                                            <Code truncate>{getBase64Decoder().decode(lastSignature)}</Code>
                                        </DataList.Value>
                                    </DataList.Item>
                                </DataList.Root>
                            </Dialog.Description>
                            <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close>
                                    <Button>Cool!</Button>
                                </Dialog.Close>
                            </Flex>
                        </Dialog.Content>
                    ) : null}
                </Dialog.Root>
                {error !== NO_ERROR ? <ErrorDialog error={error} onClose={() => seterror(NO_ERROR)} /> : null}
            </Flex>
        </FeaturePanel>
    );
}
