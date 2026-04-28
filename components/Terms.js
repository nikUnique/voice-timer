/* eslint-disable react-native/no-raw-text */
import CheckBox from "@react-native-community/checkbox";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import IconButton from "../ui/IconButton";
import { getItemFromStorage, setItemInStorage } from "../utils/helpers";
import Section from "./Section";
import { BulletPoint, Label, Paragraph, Subtitle } from "./TextUnits";
import { useResponsive } from "../hooks/useResponsive";

export default function Terms() {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const navigation = useNavigation();
  const { t } = useResponsive();

  function handleAccept(hasAccepted) {
    setIsAccepted(!isAccepted);
    setItemInStorage("termsAgreement", !isAccepted);

    if (hasAccepted === true) {
      navigation.goBack();
    }
  }

  useEffect(
    function () {
      async function load() {
        const userAgreement = await getItemFromStorage("termsAgreement");
        setIsAccepted(userAgreement);
        setIsRead(userAgreement);

        if (!userAgreement)
          Alert.alert(
            "User Agreement",
            "Please read and accept the Terms and Conditions to continue",
            [{ text: "OK" }],
          );
      }

      load();
    },
    [navigation],
  );

  useEffect(
    function () {
      if (!isAccepted) {
        navigation.setOptions({
          headerLeft: () => (
            <IconButton
              icon='exit'
              color={Colors.primaryTint90}
              size={24}
              style={{ marginRight: 32 }}
              onPress={BackHandler.exitApp}
            />
          ),
        });
      }

      if (isAccepted) {
        navigation.setOptions({
          headerLeft: undefined,
        });
      }
    },
    [isAccepted, navigation],
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  const title = {
    marginBottom: 24,
    color: Colors.primaryTint90,
    fontWeight: "bold",
    marginTop: 8,
    fontSize: t.title,
  };

  const checkboxLabel = {
    color: Colors.primaryTint90,
    fontSize: t.subheading,
  };

  const acceptedText = {
    color: Colors.primaryTint90,
    fontSize: t.subheading,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={title}>
          End User License Agreement (EULA) – Voice Timer
        </Text>

        <Subtitle>Introduction</Subtitle>
        <Section>
          <Paragraph>
            This End User License Agreement (&quot;Agreement&quot;) is a legal
            agreement between you (&quot;User&quot;) and the developer and
            publisher of Voice Timer (&quot;Licensor&quot;). By installing,
            accessing, or using the Software, you agree to be bound by the terms
            and conditions of this Agreement.
          </Paragraph>
        </Section>

        <Subtitle>Definitions</Subtitle>
        <Section>
          <Paragraph>
            <BulletPoint>
              &quot;Software&quot; refers to the Voice Timer mobile application.
            </BulletPoint>

            <BulletPoint>
              &quot;Licensor&quot; means the individual developer or legal owner
              of the Software.
            </BulletPoint>

            <BulletPoint>
              &quot;User&quot; or &quot;You&quot; means any person who installs,
              accesses, or uses the Software.
            </BulletPoint>
          </Paragraph>
        </Section>

        <Subtitle>1. Grant of License</Subtitle>
        <Section>
          <Paragraph>
            The Licensor grants the User a non-exclusive, non-transferable
            license to use the Software on a personal, non-commercial basis on
            one or more devices for the purpose of using the features provided
            by the Software, subject to the terms of this Agreement.
          </Paragraph>
          <Label>You may:</Label>
          <Paragraph>
            <BulletPoint>
              Install and use the Software on supported devices.
            </BulletPoint>
            <BulletPoint>
              Use the Software solely for personal, non-commercial use.
            </BulletPoint>
          </Paragraph>
          <Label>You may not:</Label>

          <Paragraph>
            <BulletPoint>
              Modify, distribute, sell, or transfer the Software to any third
              party.
            </BulletPoint>

            <BulletPoint>
              Reverse engineer, decompile, or disassemble the Software.
            </BulletPoint>

            <BulletPoint>
              Use the Software for any unlawful purpose.
            </BulletPoint>
          </Paragraph>
        </Section>

        <Subtitle>2. Restrictions on Use</Subtitle>

        <Label>You may not:</Label>
        <Section>
          <Paragraph>
            <BulletPoint>
              Remove, alter, or obscure any copyright or other proprietary
              notices within the Software.
            </BulletPoint>

            <BulletPoint>
              Use the Software in a way that infringes on any intellectual
              property rights, or for any unlawful activity.
            </BulletPoint>
          </Paragraph>
        </Section>

        <Subtitle>3. Intellectual Property Rights</Subtitle>
        <Section>
          <Paragraph>
            All rights, title, and interest in the Software, including but not
            limited to any intellectual property rights such as copyrights,
            patents, and trademarks, are owned by the Licensor or its licensors.
          </Paragraph>

          <Paragraph>
            The Software is licensed to you, not sold, and you do not gain any
            ownership interest in the Software.
          </Paragraph>

          <Paragraph>
            Some of the media, images, sounds, and other content used within the
            Software may be the property of third parties (“Third-Party Media”).
            The Licensor has obtained the necessary rights or licenses to use
            such Third-Party Media within the Software.
          </Paragraph>

          <Paragraph>
            You may not use, modify, distribute, or create derivative works of
            the Third-Party Media outside of the Software without the permission
            of the respective copyright holders.
          </Paragraph>
        </Section>

        <Subtitle>4. Termination</Subtitle>
        <Section>
          <Paragraph>
            This Agreement will terminate automatically without notice if you
            breach any of its terms. Upon termination, you must immediately
            cease using the Software and delete all copies from your devices.
          </Paragraph>

          <Paragraph>
            Termination of this Agreement does not affect any rights or
            obligations that have accrued prior to termination.
          </Paragraph>
        </Section>

        <Subtitle>5. Disclaimer and Limitation of Liability</Subtitle>
        <Section>
          <Paragraph>
            The Software is provided &quot;AS IS&quot;, without warranty of any
            kind, either express or implied, including, without limitation, the
            implied warranties of &quot;MERCHANTABILITY&quot; and &quot;FITNESS
            FOR A PARTICULAR PURPOSE&quot;.
          </Paragraph>
          <Paragraph>
            The Licensor does not warrant that the Software will meet your
            requirements or that it will be &quot;ERROR-FREE&quot;.
          </Paragraph>
          <Paragraph>
            To the fullest extent permitted by applicable law, the Licensor
            shall not be liable for any &quot;INDIRECT&quot;,
            &quot;INCIDENTAL&quot;, &quot;SPECIAL&quot;, or &quot;CONSEQUENTIAL
            DAMAGES&quot;, including loss of profits, arising out of or related
            to your use of or inability to use the Software, even if the
            Licensor has been advised of the possibility of such damages.
          </Paragraph>
        </Section>

        <Subtitle>6. Support and Updates</Subtitle>
        <Section>
          <Paragraph>
            The Licensor may, but is not obligated to, provide updates, bug
            fixes, or other support for the Software. Updates may be provided at
            the discretion of the Licensor, and it is your responsibility to
            install them as they become available.
          </Paragraph>
        </Section>

        <Subtitle>7. Privacy and Data Collection</Subtitle>
        <Section>
          <Paragraph>
            The Software does not collect personal data from users.
          </Paragraph>

          <Paragraph>
            However, it may display third-party advertisements, such as from
            Meta Audience Network. These third parties may collect limited
            technical or device data for ad delivery purposes.
          </Paragraph>

          <Paragraph>
            The Licensor does not access or store this data. Please refer to the
            respective third-party privacy policies for details.
          </Paragraph>
        </Section>

        <Subtitle>8. Governing Law and Jurisdiction</Subtitle>
        <Section>
          <Paragraph>
            This Agreement shall be governed by and construed in accordance with
            the laws of Kazakhstan. Any legal actions or proceedings arising
            under or in connection with this Agreement shall be brought
            exclusively in the courts located in Kazakhstan.
          </Paragraph>
        </Section>

        <Subtitle>9. Entire Agreement</Subtitle>
        <Section>
          <Paragraph>
            This Agreement constitutes the entire agreement between you and the
            Licensor concerning the use of the Software, and supersedes all
            prior or contemporaneous communications and proposals, whether
            electronic, oral, or written, between you and the Licensor.
          </Paragraph>
        </Section>

        <Subtitle>10. Amendments</Subtitle>
        <Section>
          <Paragraph>
            The Licensor reserves the right to amend or modify this Agreement at
            any time. Any amendments or updates will be posted in the Software
            or on the Licensor’s website. Your continued use of the Software
            constitutes your acceptance of any changes.
          </Paragraph>
        </Section>

        <Section>
          <Paragraph>
            By using the Software, you acknowledge that you have read and
            understand this Agreement and agree to be bound by its terms.
          </Paragraph>
          <Paragraph>
            If you do not agree to the terms of this Agreement, you must
            discontinue use of the Software and uninstall it from your device.
          </Paragraph>
        </Section>

        <Pressable
          onPress={() => setIsRead(!isRead)}
          disabled={isAccepted}
        >
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={isRead}
              onValueChange={setIsRead}
              tintColors={{
                true: isAccepted ? Colors.grayTint70 : Colors.primaryTint70,
                false: Colors.primaryTint90,
              }}
              disabled={isAccepted}
            />
            <Text style={checkboxLabel}>
              I have read and agree to the Terms and Conditions
            </Text>
          </View>
        </Pressable>

        {
          <View style={styles.acceptButton}>
            <Button
              title={isAccepted ? "Decline" : "Accept"}
              color={Colors.primaryTint40}
              onPress={() => handleAccept(!isAccepted)}
              disabled={!isRead && !isAccepted}
            />
          </View>
        }

        {isAccepted && (
          <Text style={acceptedText}>You have accepted the terms.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 16,
    marginBottom: 32,
  },

  content: {
    justifyContent: "center",
    marginBottom: 48,
  },

  checkboxContainer: {
    flexDirection: "row",
    width: "90%",
    alignItems: "center",
    marginLeft: "-1.6%",
    marginBottom: 12,
  },

  acceptButton: {
    marginBottom: 16,
  },
});
