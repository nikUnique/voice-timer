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
import { Colors } from "../../constants/colors";
import { SPACE } from "../../constants/spacing";
import { FONT } from "../../constants/typography";
import { WEIGHT } from "../../constants/weight";
import IconButton from "../../ui/IconButton";
import Section from "../../ui/Section";
import { BulletPoint, Label, Paragraph, Subtitle } from "../../ui/TextUnits";
import { getItemFromStorage, setItemInStorage } from "../../utils/helpers";

export default function Terms() {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const navigation = useNavigation();

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
              icon='arrow-back'
              color={Colors.primaryTint90}
              size={FONT.title}
              style={{ marginRight: SPACE.xxxl }}
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
    marginBottom: SPACE.xxl,
    color: Colors.primaryTint90,
    fontWeight: WEIGHT.bold,
    marginTop: SPACE.md,
    fontSize: FONT.heading,
  };

  const checkboxLabel = {
    color: Colors.primaryTint90,
    fontSize: FONT.body,
  };

  const acceptedText = {
    color: Colors.primaryTint90,
    fontSize: FONT.body,
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
            These Terms of Use (&quot;Agreement&quot;) apply between you
            (&quot;User&quot;) and the developer of Voice Timer
            (&quot;Developer&quot;). By installing, accessing, or using the
            Software, you agree to these terms. Voice Timer&apos;s source code
            is licensed under the MIT License; these terms cover your use of the
            app itself, not your rights to the code.
          </Paragraph>
        </Section>

        <Subtitle>Definitions</Subtitle>
        <Section>
          <BulletPoint>
            &quot;Software&quot; refers to the Voice Timer mobile application.
          </BulletPoint>

          <BulletPoint>
            &quot;Developer&quot; means the individual developer of the
            Software.
          </BulletPoint>

          <BulletPoint>
            &quot;User&quot; or &quot;You&quot; means any person who installs,
            accesses, or uses the Software.
          </BulletPoint>
        </Section>

        <Subtitle>1. Acceptable Use</Subtitle>
        <Section>
          <Label>You may not:</Label>

          <BulletPoint>Use the Software for any unlawful purpose.</BulletPoint>

          <BulletPoint>
            Use the Software in a way that infringes on any third party&apos;s
            intellectual property rights.
          </BulletPoint>
        </Section>

        <Subtitle>2. Third-Party Media</Subtitle>
        <Section>
          <Paragraph>
            Some media, images, sounds, or other content used within the
            Software may be the property of third parties (&quot;Third-Party
            Media&quot;). The Developer has obtained the necessary rights or
            licenses to use such Third-Party Media within the Software.
          </Paragraph>

          <Paragraph>
            You may not use, modify, distribute, or create derivative works of
            the Third-Party Media outside of the Software without the permission
            of the respective copyright holders.
          </Paragraph>
        </Section>

        <Subtitle>3. Disclaimer and Limitation of Liability</Subtitle>
        <Section>
          <Paragraph>
            The Software is provided &quot;AS IS&quot;, without warranty of any
            kind, either express or implied, including, without limitation, the
            implied warranties of &quot;MERCHANTABILITY&quot; and &quot;FITNESS
            FOR A PARTICULAR PURPOSE&quot;.
          </Paragraph>

          <Paragraph>
            The Developer does not warrant that the Software will meet your
            requirements or that it will be &quot;ERROR-FREE&quot;.
          </Paragraph>

          <Paragraph>
            To the fullest extent permitted by applicable law, the Developer
            shall not be liable for any &quot;INDIRECT&quot;,
            &quot;INCIDENTAL&quot;, &quot;SPECIAL&quot;, or &quot;CONSEQUENTIAL
            DAMAGES&quot;, including loss of profits, arising out of or related
            to your use of or inability to use the Software, even if the
            Developer has been advised of the possibility of such damages.
          </Paragraph>
        </Section>

        <Subtitle>4. Support and Updates</Subtitle>
        <Section>
          <Paragraph>
            The Developer may, but is not obligated to, provide updates, bug
            fixes, or other support for the Software. Updates may be provided at
            the discretion of the Developer, and it is your responsibility to
            install them as they become available.
          </Paragraph>
        </Section>

        <Subtitle>5. Privacy and Data Collection</Subtitle>
        <Section>
          <Paragraph>
            The Software does not collect personal data from users.
          </Paragraph>
        </Section>

        <Subtitle>6. Entire Agreement</Subtitle>
        <Section>
          <Paragraph>
            This Agreement constitutes the entire agreement between you and the
            Developer concerning the use of the Software, and supersedes all
            prior or contemporaneous communications and proposals, whether
            electronic, oral, or written, between you and the Developer.
          </Paragraph>
        </Section>

        <Subtitle>7. Amendments</Subtitle>
        <Section>
          <Paragraph>
            The Developer reserves the right to amend or modify this Agreement
            at any time. Any amendments or updates will be posted in the
            Software or on the Developer&apos;s website. Your continued use of
            the Software constitutes your acceptance of any changes.
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
    padding: SPACE.xxl,
    marginBottom: SPACE.xxxl,
  },

  content: {
    justifyContent: "center",
    marginBottom: SPACE.huge,
  },

  checkboxContainer: {
    flexDirection: "row",
    width: "90%",
    alignItems: "center",
    marginLeft: "-1.6%",
    marginBottom: SPACE.lg,
  },

  acceptButton: {
    marginBottom: SPACE.xl,
  },
});
// comment
